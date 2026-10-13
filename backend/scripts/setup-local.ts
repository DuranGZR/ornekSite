import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
async function main() {
  try {
    await readFile(".env");
    console.log(".env zaten var; korunuyor.");
    return;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const example = await readFile(".env.example", "utf8");
  await writeFile(
    ".env",
    example.replace(
      "AUTH_ENCRYPTION_KEY=",
      "AUTH_ENCRYPTION_KEY=" + randomBytes(32).toString("base64"),
    ),
    { flag: "wx", mode: 0o600 },
  );
  console.log(
    "Yerel yapılandırma hazır. npm run content:seed ve npm run admin:create çalıştır.",
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
