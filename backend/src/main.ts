import { readConfig } from "./config/config";
import { createApp } from "./server";
async function main() {
  const config = readConfig(),
    app = await createApp(config);
  await app.listen(config.PORT, config.HOST);
  console.log(`Yönetim paneli: ${config.origin}`);
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Başlatılamadı.");
  process.exitCode = 1;
});
