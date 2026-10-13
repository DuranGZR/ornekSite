import "dotenv/config";
import { z } from "zod";
import { resolve } from "node:path";

export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const schema = z.object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    HOST: z.string().default("127.0.0.1"),
    PORT: z.coerce.number().int().min(1024).max(65535).default(4400),
    APP_ORIGIN: z.url(),
    DATABASE_URL: z.string().optional(),
    AUTH_ENCRYPTION_KEY: z
      .string()
      .refine(
        (v) => Buffer.from(v, "base64").length === 32,
        "32 bayt base64 anahtar gerekli",
      ),
    LOCAL_DATABASE_PATH: z.string().default("./var/database"),
    DATABASE_SSL: z.enum(["true", "false"]).default("false"),
    TRUST_PROXY: z.enum(["false", "loopback"]).default("false"),
    CONTENT_EXPORT_PATH: z
      .string()
      .default("../frontend/src/content/published.json"),
    MEDIA_EXPORT_PATH: z.string().default("../frontend/public/managed-media"),
  });
  const result = schema.safeParse(env);
  if (!result.success)
    throw new Error(
      result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    );
  const value = result.data;
  const origin = new URL(value.APP_ORIGIN);
  if (value.APP_ORIGIN !== origin.origin)
    throw new Error("APP_ORIGIN yalnızca protokol ve host içermeli.");
  const production = value.NODE_ENV === "production";
  if (production && (origin.protocol !== "https:" || !value.DATABASE_URL))
    throw new Error(
      "Production için HTTPS APP_ORIGIN ve PostgreSQL DATABASE_URL zorunlu.",
    );
  if (
    !production &&
    origin.protocol !== "https:" &&
    !["127.0.0.1", "localhost"].includes(origin.hostname)
  )
    throw new Error("HTTP yalnızca yerel geliştirmede kullanılabilir.");
  return Object.freeze({
    ...value,
    production,
    origin: origin.origin,
    encryptionKey: Buffer.from(value.AUTH_ENCRYPTION_KEY, "base64"),
    sessionCookie: production ? "__Host-hsd_session" : "hsd_session",
    challengeCookie: production ? "__Host-hsd_challenge" : "hsd_challenge",
    databasePath: resolve(value.LOCAL_DATABASE_PATH),
    exportPath: resolve(value.CONTENT_EXPORT_PATH),
    mediaExportPath: resolve(value.MEDIA_EXPORT_PATH),
    mediaPath: resolve("var/media"),
  });
}
export type AppConfig = ReturnType<typeof readConfig>;
export const CONFIG = Symbol("APP_CONFIG");
