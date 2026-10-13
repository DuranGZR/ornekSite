import {
  ConflictException,
  Inject,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { mkdir, rename, writeFile, copyFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Database } from "../database/database";
import { AuthService } from "../auth/auth.service";
import { CONFIG, type AppConfig } from "../config/config";
import { contentSchemas, type Kind } from "./schemas";
interface Item {
  id: string;
  kind: Kind;
  slug: string;
  draft: any;
  published: any;
  version: number;
  published_at: Date | null;
  updated_at: Date;
}
@Injectable()
export class ContentService {
  constructor(
    @Inject(Database) private readonly db: Database,
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}
  list(kind: Kind) {
    return this.db
      .query<Item>(
        "SELECT * FROM content_items WHERE kind=$1 ORDER BY created_at ASC",
        [kind],
      )
      .then((r) => r.rows);
  }
  async save(
    kind: Kind,
    id: string | undefined,
    body: { data: unknown; version?: number },
    admin: string,
  ) {
    const data = contentSchemas[kind].parse(body.data);
    const slug =
      kind === "events"
        ? (data as { slug: string }).slug
        : kind === "team"
          ? "core-team"
          : kind === "visuals"
            ? "site-visuals"
            : (id ?? randomUUID());
    return this.db.transaction(async (sql) => {
      let result;
      try {
        result = id
          ? await sql.query<Item>(
              "UPDATE content_items SET draft=$1,slug=$2,version=version+1,updated_at=now() WHERE id=$3 AND kind=$4 AND version=$5 RETURNING *",
              [JSON.stringify(data), slug, id, kind, body.version],
            )
          : await sql.query<Item>(
              "INSERT INTO content_items(id,kind,slug,draft) VALUES($1,$2,$3,$4) RETURNING *",
              [randomUUID(), kind, slug, JSON.stringify(data)],
            );
      } catch (error) {
        if ((error as { code?: string }).code === "23505")
          throw new ConflictException("Bu kısa ad zaten kullanılıyor.");
        throw error;
      }
      if (!result.rows[0])
        throw new ConflictException(
          "İçerik değişmiş olabilir. Listeyi yenile.",
        );
      await this.auth.audit(admin, "content.save", result.rows[0].id, sql);
      return result.rows[0];
    });
  }
  async publish(id: string, version: number, admin: string) {
    return this.db.transaction(async (sql) => {
      const result = await sql.query<Item>(
        "UPDATE content_items SET published=draft,published_at=now(),version=version+1,updated_at=now() WHERE id=$1 AND version=$2 RETURNING *",
        [id, version],
      );
      if (!result.rows[0])
        throw new ConflictException(
          "İçerik değişmiş olabilir. Listeyi yenile.",
        );
      await sql.query(
        "UPDATE publication_state SET revision=revision+1 WHERE id=1",
      );
      await this.auth.audit(admin, "content.publish", id, sql);
      return result.rows[0];
    });
  }
  async remove(id: string, version: number, admin: string) {
    await this.db.transaction(async (sql) => {
      const item = (
        await sql.query<Item>(
          "SELECT * FROM content_items WHERE id=$1 FOR UPDATE",
          [id],
        )
      ).rows[0];
      if (item?.kind === "team" || item?.kind === "visuals")
        throw new BadRequestException(
          "Ekip kaydını silmek yerine komiteleri ve üyeleri düzenle.",
        );
      if (
        !(
          await sql.query(
            "DELETE FROM content_items WHERE id=$1 AND version=$2 RETURNING id",
            [id, version],
          )
        ).rows[0]
      )
        throw new ConflictException(
          "İçerik değişmiş olabilir. Listeyi yenile.",
        );
      await sql.query(
        "UPDATE publication_state SET revision=revision+1 WHERE id=1",
      );
      await this.auth.audit(admin, "content.delete", id, sql);
    });
    return { ok: true };
  }
  state() {
    return this.db
      .query("SELECT * FROM publication_state WHERE id=1")
      .then((r) => r.rows[0]);
  }
  async export(admin: string | null) {
    // Database advisory lock serializes publishers, including multiple server instances.
    return this.db.transaction(async (sql) => {
      await sql.query("SELECT * FROM publication_state WHERE id=1 FOR UPDATE");
      const items = (
        await sql.query<Item>(
          "SELECT * FROM content_items WHERE published IS NOT NULL ORDER BY created_at ASC",
        )
      ).rows;
      const snapshot = {
        schemaVersion: 1,
        publishedAt: new Date().toISOString(),
        events: items
          .filter((i) => i.kind === "events")
          .map((i) => i.published),
        articles: items
          .filter((i) => i.kind === "articles")
          .map((i) => i.published),
        coreTeam: items.find((i) => i.kind === "team")?.published ?? null,
        visuals: items.find((i) => i.kind === "visuals")?.published ?? null,
      };
      await mkdir(dirname(this.config.exportPath), { recursive: true });
      await mkdir(this.config.mediaExportPath, { recursive: true });
      await mkdir(this.config.mediaPath, { recursive: true });
      for (const name of await readdir(this.config.mediaPath))
        if (/^[a-f0-9-]+\.webp$/.test(name))
          await copyFile(
            join(this.config.mediaPath, name),
            join(this.config.mediaExportPath, name),
          );
      const temporary = this.config.exportPath + "." + randomUUID() + ".tmp";
      await writeFile(temporary, JSON.stringify(snapshot, null, 2) + "\n", {
        mode: 0o600,
      });
      await rename(temporary, this.config.exportPath);
      await sql.query(
        "UPDATE publication_state SET exported_revision=revision,published_at=now() WHERE id=1",
      );
      await this.auth.audit(admin, "site.export", null, sql);
      return { ok: true, publishedAt: snapshot.publishedAt };
    });
  }
}
