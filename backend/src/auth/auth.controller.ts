import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "./auth.service";
import { AuthGuard, type AuthRequest } from "./auth.guard";
import { CONFIG, type AppConfig } from "../config/config";
@Controller("api/auth")
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}
  private options(maxAge: number) {
    return {
      httpOnly: true,
      secure: this.config.production,
      sameSite: "strict" as const,
      path: "/",
      maxAge,
    };
  }
  @Post("password")
  async password(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = z
      .object({
        username: z.string().trim().toLowerCase().min(3).max(80),
        password: z.string().min(1).max(256),
      })
      .strict()
      .parse(body);
    const result = await this.auth.password(
      data.username,
      data.password,
      req.ip ?? "unknown",
    );
    res.cookie(
      this.config.challengeCookie,
      result.challenge,
      this.options(300000),
    );
    return { needsSetup: result.needsSetup };
  }
  @Get("enrollment")
  enrollment(@Req() req: Request) {
    return this.auth.enrollment(
      req.cookies?.[this.config.challengeCookie] ?? "",
    );
  }
  @Post("verify")
  async verify(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { code } = z
      .object({ code: z.string().trim().max(32) })
      .strict()
      .parse(body);
    const result = await this.auth.secondFactor(
      req.cookies?.[this.config.challengeCookie] ?? "",
      code,
    );
    res.clearCookie(this.config.challengeCookie, this.options(0));
    res.cookie(
      this.config.sessionCookie,
      result.sessionToken,
      this.options(8 * 3600000),
    );
    return { recoveryCodes: result.recoveryCodes };
  }
  @Get("session")
  @UseGuards(AuthGuard)
  session(@Req() req: AuthRequest) {
    return {
      username: req.session.username,
      csrfToken: req.session.csrf_token,
      expiresAt: req.session.expires_at,
    };
  }
  @Post("logout")
  @UseGuards(AuthGuard)
  async logout(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(req.session);
    res.clearCookie(this.config.sessionCookie, this.options(0));
    return { ok: true };
  }
}
