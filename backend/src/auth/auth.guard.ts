import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService, type Session } from "./auth.service";
import { CONFIG, type AppConfig } from "../config/config";
export type AuthRequest = Request & { session: Session };
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    req.session = await this.auth.session(
      req.cookies?.[this.config.sessionCookie],
    );
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.get("X-CSRF-Token") !== req.session.csrf_token
    )
      throw new ForbiddenException("İstek doğrulanamadı.");
    return true;
  }
}
