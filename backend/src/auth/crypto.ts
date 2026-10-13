import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import * as argon2 from "argon2";
export const token = () => randomBytes(32).toString("base64url");
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const hashPassword = (value: string) =>
  argon2.hash(value, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
export const verifyPassword = (hash: string, value: string) =>
  argon2.verify(hash, value);
export function encrypt(value: string, key: Buffer) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), encrypted]
    .map((b) => b.toString("base64"))
    .join(".");
}
export function decrypt(value: string, key: Buffer) {
  const parts = value.split(".").map((p) => Buffer.from(p, "base64"));
  if (parts.length !== 3) throw new Error("Geçersiz şifreli veri.");
  const decipher = createDecipheriv("aes-256-gcm", key, parts[0]!);
  decipher.setAuthTag(parts[1]!);
  return Buffer.concat([decipher.update(parts[2]!), decipher.final()]).toString(
    "utf8",
  );
}
