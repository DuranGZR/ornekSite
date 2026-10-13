import {
  Inject,
  Injectable,
  UnauthorizedException,
  HttpException,
} from "@nestjs/common";
import { randomUUID, randomBytes } from "node:crypto";
import * as OTPAuth from "otpauth";
import { Database, type Sql } from "../database/database";
import { CONFIG, type AppConfig } from "../config/config";
import { decrypt, digest, hashPassword, token, verifyPassword } from "./crypto";

interface Admin {
  id: string;
  username: string;
  password_hash: string;
  mfa_secret: string;
  mfa_enabled: boolean;
  disabled: boolean;
  last_totp_step: string;
}
export interface Session {
  token_hash: string;
  admin_id: string;
  username: string;
  csrf_token: string;
  expires_at: Date;
}
const denied = () =>
  new UnauthorizedException("Giriş bilgileri veya doğrulama kodu geçersiz.");
@Injectable()
export class AuthService {
  private dummyHash = "";
  constructor(
    @Inject(Database) private readonly db: Database,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}
  async onModuleInit() {
    this.dummyHash = await hashPassword(token());
  }
  async audit(
    admin: string | null,
    action: string,
    target: string | null = null,
    sql: Sql = this.db,
  ) {
    await sql.query(
      "INSERT INTO audit_logs(id,admin_id,action,target) VALUES($1,$2,$3,$4)",
      [randomUUID(), admin, action, target],
    );
  }
  private async limit(key: string, maximum: number) {
    const r = await this.db.query<{ hits: number }>(
      `INSERT INTO rate_limits(key,hits,expires_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN rate_limits.expires_at<now() THEN 1 ELSE rate_limits.hits+1 END, expires_at=CASE WHEN rate_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE rate_limits.expires_at END RETURNING hits`,
      [key],
    );
    if (r.rows[0]!.hits > maximum)
      throw new HttpException(
        "Çok fazla deneme. 15 dakika sonra tekrar dene.",
        429,
      );
  }
  async password(username: string, password: string, ip: string) {
    await this.limit("ip:" + digest(ip), 100);
    await this.limit("user:" + digest(username), 10);
    const admin = (
      await this.db.query<Admin>("SELECT * FROM admins WHERE username=$1", [
        username,
      ])
    ).rows[0];
    const valid = await verifyPassword(
      admin?.password_hash ?? this.dummyHash,
      password,
    );
    if (!admin || !valid || admin.disabled) {
      await this.audit(null, "auth.password.failed");
      throw denied();
    }
    const challenge = token();
    await this.db.query(
      "INSERT INTO login_challenges(token_hash,admin_id,expires_at) VALUES($1,$2,now()+interval '5 minutes')",
      [digest(challenge), admin.id],
    );
    return { challenge, needsSetup: !admin.mfa_enabled };
  }
  async enrollment(challenge: string) {
    const admin = (
      await this.db.query<Admin>(
        "SELECT a.* FROM admins a JOIN login_challenges c ON c.admin_id=a.id WHERE c.token_hash=$1 AND c.expires_at>now() AND c.attempts<5 AND NOT a.disabled",
        [digest(challenge)],
      )
    ).rows[0];
    if (!admin || admin.mfa_enabled) throw denied();
    const totp = this.totp(admin);
    return { secret: totp.secret.base32, uri: totp.toString() };
  }
  private totp(admin: Admin) {
    return new OTPAuth.TOTP({
      issuer: "HSD İnönü",
      label: admin.username,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: decrypt(admin.mfa_secret, this.config.encryptionKey),
    });
  }
  async secondFactor(challenge: string, code: string) {
    // Attempt count is committed before verification so failures cannot roll it back.
    const c = (
      await this.db.query<{ admin_id: string }>(
        "UPDATE login_challenges SET attempts=attempts+1 WHERE token_hash=$1 AND expires_at>now() AND attempts<5 RETURNING admin_id",
        [digest(challenge)],
      )
    ).rows[0];
    if (!c) throw denied();
    const sessionToken = token(),
      csrf = token();
    let recoveryCodes: string[] = [];
    await this.db.transaction(async (sql) => {
      const admin = (
        await sql.query<Admin>("SELECT * FROM admins WHERE id=$1 FOR UPDATE", [
          c.admin_id,
        ])
      ).rows[0];
      if (!admin || admin.disabled) throw denied();
      const totp = this.totp(admin),
        delta = /^\d{6}$/.test(code)
          ? totp.validate({ token: code, window: 1 })
          : null;
      let accepted = false;
      if (delta !== null) {
        const step = totp.counter() + delta;
        accepted =
          (
            await sql.query(
              "UPDATE admins SET last_totp_step=$1 WHERE id=$2 AND last_totp_step<$1",
              [step, admin.id],
            )
          ).rowCount === 1;
      } else if (admin.mfa_enabled && /^[a-f0-9]{32}$/.test(code)) {
        accepted =
          (
            await sql.query(
              "DELETE FROM recovery_codes WHERE admin_id=$1 AND code_hash=$2",
              [admin.id, digest(code)],
            )
          ).rowCount === 1;
      }
      if (!accepted) throw denied();
      // Concurrent requests using a challenge must not create multiple sessions.
      if (
        (
          await sql.query("DELETE FROM login_challenges WHERE token_hash=$1", [
            digest(challenge),
          ])
        ).rowCount !== 1
      )
        throw denied();
      if (!admin.mfa_enabled) {
        recoveryCodes = Array.from({ length: 8 }, () =>
          randomBytes(16).toString("hex"),
        );
        for (const recovery of recoveryCodes)
          await sql.query(
            "INSERT INTO recovery_codes(admin_id,code_hash) VALUES($1,$2)",
            [admin.id, digest(recovery)],
          );
        await sql.query("UPDATE admins SET mfa_enabled=true WHERE id=$1", [
          admin.id,
        ]);
      }
      await sql.query(
        "INSERT INTO sessions(token_hash,admin_id,csrf_token,expires_at) VALUES($1,$2,$3,now()+interval '8 hours')",
        [digest(sessionToken), admin.id, csrf],
      );
      await this.audit(admin.id, "auth.login", null, sql);
    });
    return { sessionToken, recoveryCodes };
  }
  async session(raw?: string): Promise<Session> {
    if (!raw) throw new UnauthorizedException("Oturum açman gerekiyor.");
    const s = (
      await this.db.query<Session>(
        `UPDATE sessions s SET last_seen_at=now() FROM admins a WHERE s.token_hash=$1 AND a.id=s.admin_id AND NOT a.disabled AND a.mfa_enabled AND s.expires_at>now() AND s.last_seen_at>now()-interval '30 minutes' RETURNING s.*,a.username`,
        [digest(raw)],
      )
    ).rows[0];
    if (!s)
      throw new UnauthorizedException("Oturum sona erdi. Yeniden giriş yap.");
    return s;
  }
  async logout(s: Session) {
    await this.db.query("DELETE FROM sessions WHERE token_hash=$1", [
      s.token_hash,
    ]);
    await this.audit(s.admin_id, "auth.logout");
  }
}
