import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import * as OTPAuth from "otpauth";
import sharp from "sharp";
import { readConfig } from "../src/config/config";
import { createApp } from "../src/server";
import { Database } from "../src/database/database";
import { encrypt, hashPassword, digest } from "../src/auth/crypto";
import { initialEvents } from "../../frontend/src/content/data";
import { initialCoreTeam } from "../../frontend/src/content/team";
import { initialVisuals } from "../../frontend/src/content/visuals";

test("Yönetim paneli: gerçek SQL üzerinde güvenlik ve yayın akışı", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "hsd-admin-"));
  const config = {
    ...readConfig({
      NODE_ENV: "test",
      APP_ORIGIN: "http://127.0.0.1:4400",
      AUTH_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
      CONTENT_EXPORT_PATH: join(dir, "published.json"),
      MEDIA_EXPORT_PATH: join(dir, "public"),
    }),
    mediaPath: join(dir, "media"),
  };
  const app = await createApp(config, true),
    db = app.get(Database),
    server = app.getHttpServer(),
    agent = request.agent(server);
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({ secret });
  const admin = randomUUID(),
    password = "QA-only-test-password-123!";
  await db.query(
    "INSERT INTO admins(id,username,password_hash,mfa_secret) VALUES($1,$2,$3,$4)",
    [
      admin,
      "test-admin",
      await hashPassword(password),
      encrypt(secret.base32, config.encryptionKey),
    ],
  );
  let csrf = "",
    recovery: string[] = [];
  try {
    await t.test("Kimliksiz erişim ve farklı Origin engellenir", async () => {
      await agent.get("/api/admin/content/events").expect(401);
      await agent
        .post("/api/auth/password")
        .set("Origin", "https://evil.example")
        .send({ username: "test-admin", password })
        .expect(403);
      await agent
        .post("/api/auth/password")
        .set("Origin", config.origin)
        .send({ username: "test-admin", password: "wrong" })
        .expect(401);
    });
    await t.test(
      "Parola tek başına oturum açmaz; MFA kurulumu ve kurtarma kodları",
      async () => {
        const login = await agent
          .post("/api/auth/password")
          .set("Origin", config.origin)
          .send({ username: "test-admin", password })
          .expect(201);
        assert.equal(login.body.needsSetup, true);
        await agent.get("/api/admin/content/events").expect(401);
        const enrollment = await agent.get("/api/auth/enrollment").expect(200);
        assert.equal(enrollment.body.secret, secret.base32);
        const verify = await agent
          .post("/api/auth/verify")
          .set("Origin", config.origin)
          .send({ code: totp.generate() })
          .expect(201);
        recovery = verify.body.recoveryCodes;
        assert.equal(recovery.length, 8);
        assert(
          verify.headers["set-cookie"].some(
            (s: string) =>
              s.includes("HttpOnly") && s.includes("SameSite=Strict"),
          ),
        );
        csrf = (await agent.get("/api/auth/session").expect(200)).body
          .csrfToken;
        await agent.get("/api/auth/enrollment").expect(401);
      },
    );
    const mutate = (
      method: "post" | "patch" | "delete",
      path: string,
      data: any,
    ) =>
      agent[method](path)
        .set("Origin", config.origin)
        .set("X-CSRF-Token", csrf)
        .send(data);
    let id = "",
      version = 1;
    await t.test("CSRF, sıkı şema ve URL doğrulaması", async () => {
      await agent
        .post("/api/admin/content/events")
        .set("Origin", config.origin)
        .send({ data: initialEvents[0] })
        .expect(403);
      await mutate("post", "/api/admin/content/events", {
        data: { ...initialEvents[0], source: "javascript:alert(1)" },
      }).expect(400);
      await mutate("post", "/api/admin/content/events", {
        data: { ...initialEvents[0], unexpected: true },
      }).expect(400);
      await mutate("post", "/api/admin/content/events", {
        data: { ...initialEvents[0], date: "2026-02-30" },
      }).expect(400);
    });
    await t.test(
      "Taslaklar sızmaz; yayın, sürüm çakışması ve dosya aktarımı",
      async () => {
        const created = await mutate("post", "/api/admin/content/events", {
          data: initialEvents[0],
        }).expect(201);
        id = created.body.id;
        version = created.body.version;
        assert.equal(created.body.published, null);
        await mutate("post", "/api/admin/export", {}).expect(201);
        assert.equal(
          JSON.parse(await readFile(config.exportPath, "utf8")).events.length,
          0,
        );
        await mutate("patch", "/api/admin/content/events/" + id, {
          data: initialEvents[0],
          version: 99,
        }).expect(409);
        const published = await mutate("post", "/api/admin/publish/" + id, {
          version,
        }).expect(201);
        version = published.body.version;
        const edited = await mutate(
          "patch",
          "/api/admin/content/events/" + id,
          { data: { ...initialEvents[0], title: "Yeni taslak" }, version },
        ).expect(200);
        version = edited.body.version;
        await mutate("post", "/api/admin/export", {}).expect(201);
        assert.equal(
          JSON.parse(await readFile(config.exportPath, "utf8")).events[0].title,
          initialEvents[0]!.title,
        );
        await mutate("post", "/api/admin/content/team", {
          data: initialCoreTeam,
        }).expect(201);
        await mutate("post", "/api/admin/content/team", {
          data: initialCoreTeam,
        }).expect(409);
      },
    );
    await t.test(
      "Logo ve kapaklar: singleton, taslak ve yayın ayrımı",
      async () => {
        const created = await mutate("post", "/api/admin/content/visuals", {
          data: initialVisuals,
        }).expect(201);
        await mutate("post", "/api/admin/content/visuals", {
          data: initialVisuals,
        }).expect(409);
        await mutate("post", "/api/admin/content/visuals", {
          data: {
            ...initialVisuals,
            logo: { ...initialVisuals.logo, image: "/untrusted.svg" },
          },
        }).expect(400);
        await mutate("post", "/api/admin/publish/" + created.body.id, {
          version: created.body.version,
        }).expect(201);
        const record = (
          await agent.get("/api/admin/content/visuals").expect(200)
        ).body[0];
        await mutate("patch", "/api/admin/content/visuals/" + record.id, {
          version: record.version,
          data: {
            ...initialVisuals,
            home: { ...initialVisuals.home, image: "/managed-media/test.webp" },
          },
        }).expect(200);
        await mutate("post", "/api/admin/export", {}).expect(201);
        const exported = JSON.parse(await readFile(config.exportPath, "utf8"));
        assert.equal(exported.visuals.home.image, initialVisuals.home.image);
        assert.equal(exported.visuals.logo.image, "/hsd-logo.svg");
        await mutate("delete", "/api/admin/content/" + record.id, {
          version: record.version + 1,
        }).expect(400);
      },
    );
    await t.test(
      "Film galerisi: doğrulama, sıralama, yayın ve boş galeri",
      async () => {
        const record = (
          await agent.get("/api/admin/content/visuals").expect(200)
        ).body[0];
        await mutate("patch", "/api/admin/content/visuals/" + record.id, {
          version: record.version,
          data: {
            ...record.draft,
            gallery: [{ ...initialVisuals.gallery![0], row: 4 }],
          },
        }).expect(400);
        await mutate("patch", "/api/admin/content/visuals/" + record.id, {
          version: record.version,
          data: {
            ...record.draft,
            gallery: [
              { ...initialVisuals.gallery![0], image: "javascript:alert(1)" },
            ],
          },
        }).expect(400);
        const gallery = [...initialVisuals.gallery!].reverse();
        const saved = await mutate(
          "patch",
          "/api/admin/content/visuals/" + record.id,
          {
            version: record.version,
            data: { ...initialVisuals, gallery },
          },
        ).expect(200);
        await mutate("post", "/api/admin/export", {}).expect(201);
        assert.deepEqual(
          JSON.parse(await readFile(config.exportPath, "utf8")).visuals.gallery,
          initialVisuals.gallery,
        );
        const published = await mutate(
          "post",
          "/api/admin/publish/" + record.id,
          { version: saved.body.version },
        ).expect(201);
        await mutate("post", "/api/admin/export", {}).expect(201);
        assert.deepEqual(
          JSON.parse(await readFile(config.exportPath, "utf8")).visuals.gallery,
          gallery,
        );
        const cleared = await mutate(
          "patch",
          "/api/admin/content/visuals/" + record.id,
          {
            version: published.body.version,
            data: { ...initialVisuals, gallery: [] },
          },
        ).expect(200);
        await mutate("post", "/api/admin/publish/" + record.id, {
          version: cleared.body.version,
        }).expect(201);
        await mutate("post", "/api/admin/export", {}).expect(201);
        assert.deepEqual(
          JSON.parse(await readFile(config.exportPath, "utf8")).visuals.gallery,
          [],
        );
      },
    );
    await t.test(
      "Katıl fotoğrafları: bağımsız taslak, yayın ve aktarım",
      async () => {
        const record = (
          await agent.get("/api/admin/content/visuals").expect(200)
        ).body[0];
        const data = {
          ...record.draft,
          joinMain: initialVisuals.joinSmall,
          joinSmall: initialVisuals.joinMain,
        };
        await mutate("patch", "/api/admin/content/visuals/" + record.id, {
          version: record.version,
          data: {
            ...data,
            joinSmall: { ...data.joinSmall, image: "javascript:alert(1)" },
          },
        }).expect(400);
        const saved = await mutate(
          "patch",
          "/api/admin/content/visuals/" + record.id,
          {
            version: record.version,
            data,
          },
        ).expect(200);
        await mutate("post", "/api/admin/export", {}).expect(201);
        assert.deepEqual(
          JSON.parse(await readFile(config.exportPath, "utf8")).visuals
            .joinMain,
          initialVisuals.joinMain,
        );
        await mutate("post", "/api/admin/publish/" + record.id, {
          version: saved.body.version,
        }).expect(201);
        await mutate("post", "/api/admin/export", {}).expect(201);
        const exported = JSON.parse(await readFile(config.exportPath, "utf8"));
        assert.deepEqual(exported.visuals.joinMain, data.joinMain);
        assert.deepEqual(exported.visuals.joinSmall, data.joinSmall);
        assert.deepEqual(exported.visuals.home, initialVisuals.home);
      },
    );
    await t.test(
      "Görseller yeniden kodlanır; SVG ve sahte dosyalar reddedilir",
      async () => {
        const upload = (data: Buffer, name: string) =>
          agent
            .post("/api/admin/media")
            .set("Origin", config.origin)
            .set("X-CSRF-Token", csrf)
            .attach("file", data, name);
        await upload(
          Buffer.from('<svg onload="alert(1)"></svg>'),
          "image.svg",
        ).expect(400);
        const png = await sharp({
          create: { width: 16, height: 16, channels: 3, background: "red" },
        })
          .png()
          .toBuffer();
        const response = await upload(png, "image.png").expect(201);
        assert.match(response.body.url, /^\/managed-media\/[a-f0-9-]+\.webp$/);
        assert.equal(response.body.width, 16);
        await mutate("post", "/api/admin/export", {}).expect(201);
        const filename = response.body.url.split("/").pop();
        assert.equal(
          (
            await sharp(
              await readFile(join(config.mediaExportPath, filename)),
            ).metadata()
          ).format,
          "webp",
        );
      },
    );
    await t.test(
      "Oturum çıkışı, OTP tekrar kullanımı ve tek kullanımlık kurtarma",
      async () => {
        await mutate("post", "/api/auth/logout", {}).expect(201);
        await agent.get("/api/admin/audit").expect(401);
        await agent
          .post("/api/auth/password")
          .set("Origin", config.origin)
          .send({ username: "test-admin", password })
          .expect(201);
        await agent
          .post("/api/auth/verify")
          .set("Origin", config.origin)
          .send({ code: totp.generate() })
          .expect(401);
        await agent
          .post("/api/auth/verify")
          .set("Origin", config.origin)
          .send({ code: recovery[0] })
          .expect(201);
        csrf = (await agent.get("/api/auth/session").expect(200)).body
          .csrfToken;
        const cookie = (
          await db.query<{ token_hash: string }>(
            "SELECT token_hash FROM sessions WHERE admin_id=$1",
            [admin],
          )
        ).rows[0]!.token_hash;
        await db.query(
          "UPDATE sessions SET last_seen_at=now()-interval '31 minutes' WHERE token_hash=$1",
          [cookie],
        );
        await agent.get("/api/admin/content/events").expect(401);
        await agent
          .post("/api/auth/password")
          .set("Origin", config.origin)
          .send({ username: "test-admin", password })
          .expect(201);
        await agent
          .post("/api/auth/verify")
          .set("Origin", config.origin)
          .send({ code: recovery[0] })
          .expect(401);
      },
    );
    await t.test("Parola denemeleri sınırlandırılır", async () => {
      await db.query("DELETE FROM rate_limits");
      for (let i = 0; i < 10; i++)
        await agent
          .post("/api/auth/password")
          .set("Origin", config.origin)
          .send({ username: "missing-user", password: "wrong" })
          .expect(401);
      await agent
        .post("/api/auth/password")
        .set("Origin", config.origin)
        .send({ username: "missing-user", password: "wrong" })
        .expect(429);
    });
  } finally {
    await app.close();
    await rm(dir, { recursive: true, force: true });
  }
});
