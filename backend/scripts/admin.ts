import "reflect-metadata";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { randomUUID } from "node:crypto";
import { Secret } from "otpauth";
import { Database } from "../src/database/database";
import { readConfig } from "../src/config/config";
import { encrypt, hashPassword } from "../src/auth/crypto";
async function main() {
  const config = readConfig(),
    db = new Database(config);
  await db.onModuleInit();
  let muted = false;
  const output = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) process.stdout.write(chunk, encoding);
      callback();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  try {
    const username = (await rl.question("Yönetici kullanıcı adı: "))
      .trim()
      .toLowerCase();
    if (!/^[a-z0-9._-]{3,80}$/.test(username))
      throw new Error("3–80 karakter; küçük harf, sayı, nokta, tire kullan.");
    const action = process.argv[2];
    if (action === "create" || action === "reset-password") {
      process.stdout.write("Parola (en az 14 karakter, gizli): ");
      muted = true;
      const password = await rl.question("");
      muted = false;
      process.stdout.write("\n");
      process.stdout.write("Parola tekrar: ");
      muted = true;
      const confirmation = await rl.question("");
      muted = false;
      process.stdout.write("\n");
      if (
        password.length < 14 ||
        password.length > 256 ||
        password !== confirmation
      )
        throw new Error("Parolalar eşleşmeli ve 14–256 karakter olmalı.");
      const hash = await hashPassword(password);
      if (action === "create")
        await db.query(
          "INSERT INTO admins(id,username,password_hash,mfa_secret) VALUES($1,$2,$3,$4)",
          [
            randomUUID(),
            username,
            hash,
            encrypt(new Secret({ size: 20 }).base32, config.encryptionKey),
          ],
        );
      else if (
        (
          await db.query(
            "UPDATE admins SET password_hash=$1 WHERE username=$2",
            [hash, username],
          )
        ).rowCount !== 1
      )
        throw new Error("Yönetici bulunamadı.");
    } else if (action === "reset-mfa") {
      if (
        (
          await db.query(
            "UPDATE admins SET mfa_secret=$1,mfa_enabled=false,last_totp_step=-1 WHERE username=$2",
            [
              encrypt(new Secret({ size: 20 }).base32, config.encryptionKey),
              username,
            ],
          )
        ).rowCount !== 1
      )
        throw new Error("Yönetici bulunamadı.");
      await db.query(
        "DELETE FROM recovery_codes WHERE admin_id=(SELECT id FROM admins WHERE username=$1)",
        [username],
      );
    } else throw new Error("Geçersiz komut.");
    await db.query(
      "DELETE FROM sessions WHERE admin_id=(SELECT id FROM admins WHERE username=$1)",
      [username],
    );
    await db.query(
      "DELETE FROM login_challenges WHERE admin_id=(SELECT id FROM admins WHERE username=$1)",
      [username],
    );
    await db.query(
      "INSERT INTO audit_logs(id,admin_id,action,target) SELECT $1,id,$2,id::text FROM admins WHERE username=$3",
      [randomUUID(), "admin." + action, username],
    );
    console.log(
      "İşlem tamamlandı. İlk girişte doğrulama uygulamasını eşleştir.",
    );
  } finally {
    rl.close();
    await db.onModuleDestroy();
  }
}
main().catch((error) => {
  console.error(
    error.code === "23505" ? "Kullanıcı adı zaten var." : error.message,
  );
  process.exitCode = 1;
});
