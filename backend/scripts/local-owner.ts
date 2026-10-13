import "reflect-metadata";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { Secret } from "otpauth";
import { readConfig } from "../src/config/config";
import { Database } from "../src/database/database";
import { encrypt, hashPassword } from "../src/auth/crypto";
async function main() {
  const config = readConfig();
  if (config.NODE_ENV !== "development")
    throw new Error("Yalnızca yerel geliştirme için.");
  const db = new Database(config);
  await db.onModuleInit();
  try {
    if ((await db.query("SELECT id FROM admins LIMIT 1")).rows.length)
      throw new Error("Yönetici zaten var. Mevcut hesaplar korunuyor.");
    const password = randomBytes(24).toString("base64url");
    await mkdir("var", { recursive: true });
    await writeFile(
      "var/local-access.txt",
      `HSD İnönü — yalnızca yerel geliştirme\nAdres: ${config.origin}\nKullanıcı: local-owner\nParola: ${password}\n\nİlk girişte MFA eşleştir ve kurtarma kodlarını sakla.\nBu dosyayı paylaşma veya Git içine ekleme. Canlı ortamda admin:create kullan.\n`,
      { flag: "wx", mode: 0o600 },
    );
    await db.query(
      "INSERT INTO admins(id,username,password_hash,mfa_secret) VALUES($1,$2,$3,$4)",
      [
        randomUUID(),
        "local-owner",
        await hashPassword(password),
        encrypt(new Secret({ size: 20 }).base32, config.encryptionKey),
      ],
    );
    console.log("Yerel giriş bilgileri var/local-access.txt dosyasında.");
  } finally {
    await db.onModuleDestroy();
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
