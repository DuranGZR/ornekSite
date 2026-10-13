import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Pool, type PoolClient } from "pg";
import { PGlite } from "@electric-sql/pglite";
import { mkdir } from "node:fs/promises";
import { CONFIG, type AppConfig } from "../config/config";
import { migration, visualsMigration } from "./schema";

export interface Sql {
  query<T = Record<string, unknown>>(
    sql: string,
    values?: unknown[],
  ): Promise<{ rows: T[]; rowCount: number }>;
}
@Injectable()
export class Database implements Sql, OnModuleInit, OnModuleDestroy {
  private pg?: Pool;
  private local?: PGlite;
  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}
  async onModuleInit() {
    if (this.config.DATABASE_URL) {
      this.pg = new Pool({
        connectionString: this.config.DATABASE_URL,
        max: 10,
        connectionTimeoutMillis: 5000,
        ssl:
          this.config.DATABASE_SSL === "true"
            ? { rejectUnauthorized: true }
            : false,
      });
      await this.pg.query("SELECT 1");
    } else {
      if (this.config.NODE_ENV !== "test")
        await mkdir(this.config.databasePath, { recursive: true });
      this.local = new PGlite(
        this.config.NODE_ENV === "test" ? undefined : this.config.databasePath,
      );
      await this.local.waitReady;
    }
    if (!this.config.production) await this.migrate();
    else if (
      !(
        await this.query(
          "SELECT version FROM schema_migrations WHERE version=2",
        )
      ).rows.length
    )
      throw new Error("Veritabanı şeması hazır değil. db:migrate çalıştır.");
  }
  async migrate() {
    await this.transaction(async (sql) => {
      for (const statement of migration
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean))
        await sql.query(statement);
      if (
        !(
          await sql.query(
            "SELECT version FROM schema_migrations WHERE version=2",
          )
        ).rows.length
      ) {
        for (const statement of visualsMigration
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean))
          await sql.query(statement);
      }
    });
  }
  async query<T = Record<string, unknown>>(
    text: string,
    values: unknown[] = [],
  ) {
    if (this.pg) {
      const result = await this.pg.query(text, values);
      return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
    }
    if (!this.local) throw new Error("Veritabanı hazır değil.");
    const result = await this.local.query<T>(text, values);
    return {
      rows: result.rows,
      rowCount: result.affectedRows ?? result.rows.length,
    };
  }
  async transaction<T>(work: (sql: Sql) => Promise<T>): Promise<T> {
    if (this.local)
      return this.local.transaction(async (tx) =>
        work({
          query: async <R>(text: string, values: unknown[] = []) => {
            const result = await tx.query<R>(text, values);
            return {
              rows: result.rows,
              rowCount: result.affectedRows ?? result.rows.length,
            };
          },
        }),
      );
    if (!this.pg) throw new Error("Veritabanı hazır değil.");
    const client: PoolClient = await this.pg.connect();
    try {
      await client.query("BEGIN");
      const result = await work({
        query: async <R>(text: string, values: unknown[] = []) => {
          const r = await client.query(text, values);
          return { rows: r.rows as R[], rowCount: r.rowCount ?? 0 };
        },
      });
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  async onModuleDestroy() {
    await this.pg?.end();
    await this.local?.close();
  }
}
