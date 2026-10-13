import "reflect-metadata";
import { randomUUID } from "node:crypto";
import { Database } from "../src/database/database";
import { readConfig } from "../src/config/config";
import { visualsSchema } from "../src/content/schemas";
import { initialVisuals } from "../../frontend/src/content/visuals";
async function main() {
  const db = new Database(readConfig());
  await db.onModuleInit();
  try {
    const data = JSON.stringify(visualsSchema.parse(initialVisuals));
    await db.query(
      "INSERT INTO content_items(id,kind,slug,draft,published,published_at) VALUES($1,'visuals','site-visuals',$2,$2,now()) ON CONFLICT(kind,slug) DO NOTHING",
      [randomUUID(), data],
    );
    console.log("Site görselleri hazır. Mevcut ayarlar korunuyor.");
  } finally {
    await db.onModuleDestroy();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
