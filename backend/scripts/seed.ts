import "reflect-metadata";
import { randomUUID } from "node:crypto";
import {
  initialEvents as events,
  initialArticles as articles,
} from "../../frontend/src/content/data";
import { initialCoreTeam as coreTeam } from "../../frontend/src/content/team";
import { initialVisuals } from "../../frontend/src/content/visuals";
import { Database } from "../src/database/database";
import { readConfig } from "../src/config/config";
import { contentSchemas, type Kind } from "../src/content/schemas";
async function main() {
  const db = new Database(readConfig());
  await db.onModuleInit();
  try {
    if ((await db.query("SELECT id FROM content_items LIMIT 1")).rows.length)
      throw new Error("İçerik zaten var; mevcut kayıtlar korunuyor.");
    await db.transaction(async (sql) => {
      for (const [kind, entries] of [
        ["events", events],
        ["articles", articles],
        ["team", [coreTeam]],
        ["visuals", [initialVisuals]],
      ] as [Kind, unknown[]][]) {
        for (const raw of entries) {
          const data = contentSchemas[kind].parse(raw);
          const id = randomUUID();
          await sql.query(
            "INSERT INTO content_items(id,kind,slug,draft,published,published_at) VALUES($1,$2,$3,$4,$4,now())",
            [
              id,
              kind,
              kind === "events"
                ? (data as { slug: string }).slug
                : kind === "team"
                  ? "core-team"
                  : kind === "visuals"
                    ? "site-visuals"
                    : id,
              JSON.stringify(data),
            ],
          );
        }
      }
    });
    console.log(
      "Mevcut etkinlikler, Medium yazıları ve ekip taslağı aktarıldı.",
    );
  } finally {
    await db.onModuleDestroy();
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
