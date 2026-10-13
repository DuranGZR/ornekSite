import "reflect-metadata";
import { randomUUID } from "node:crypto";
import { initialArticles } from "../../frontend/src/content/data";
import { readConfig } from "../src/config/config";
import { createApp } from "../src/server";
import { Database } from "../src/database/database";
import { ContentService } from "../src/content/content.service";
import { articleSchema } from "../src/content/schemas";
async function main() {
  const config = readConfig();
  if (config.production)
    throw new Error("Bu aktarım yalnızca yerel ortam içindir.");
  const app = await createApp(config);
  try {
    const db = app.get(Database);
    let added = 0;
    await db.transaction(async (sql) => {
      for (const raw of initialArticles) {
        const data = articleSchema.parse(raw);
        const exists = await sql.query(
          "SELECT id FROM content_items WHERE kind='articles' AND (draft->>'href'=$1 OR published->>'href'=$1)",
          [data.href],
        );
        if (exists.rows.length) continue;
        const id = randomUUID();
        await sql.query(
          "INSERT INTO content_items(id,kind,slug,draft,published,published_at) VALUES($1,'articles',$2,$3,$3,now())",
          [id, id, JSON.stringify(data)],
        );
        await sql.query(
          "INSERT INTO audit_logs(id,action,target) VALUES($1,'content.import.medium',$2)",
          [randomUUID(), id],
        );
        added++;
      }
      if (added)
        await sql.query(
          "UPDATE publication_state SET revision=revision+1 WHERE id=1",
        );
    });
    await app.get(ContentService).export(null);
    console.log(
      `${added} Medium yazısı eklendi ve siteye aktarıldı. Mevcut yazılar korundu.`,
    );
  } finally {
    await app.close();
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
