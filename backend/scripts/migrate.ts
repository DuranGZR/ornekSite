import "reflect-metadata";
import { Database } from "../src/database/database";
import { readConfig } from "../src/config/config";
async function main() {
  const config = readConfig();
  const db = new Database({ ...config, production: false });
  await db.onModuleInit();
  await db.onModuleDestroy();
  console.log("Veritabanı şeması hazır.");
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
