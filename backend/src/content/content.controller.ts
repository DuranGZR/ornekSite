import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { z } from "zod";
import { AuthGuard, type AuthRequest } from "../auth/auth.guard";
import { AuthService } from "../auth/auth.service";
import { Database } from "../database/database";
import { CONFIG, type AppConfig } from "../config/config";
import { ContentService } from "./content.service";
import { kindSchema, writeSchema } from "./schemas";
const uuid = z.uuid(),
  versionSchema = z.object({ version: z.number().int().positive() }).strict();
@Controller("api/admin")
@UseGuards(AuthGuard)
export class ContentController {
  constructor(
    @Inject(ContentService) private readonly content: ContentService,
    @Inject(Database) private readonly db: Database,
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(AuthService) private readonly auth: AuthService,
  ) {}
  @Get("publication") state() {
    return this.content.state();
  }
  @Post("export") export(@Req() req: AuthRequest) {
    return this.content.export(req.session.admin_id);
  }
  @Get("audit") audit() {
    return this.db
      .query(
        "SELECT l.action,l.target,l.created_at,a.username FROM audit_logs l LEFT JOIN admins a ON a.id=l.admin_id ORDER BY l.created_at DESC LIMIT 100",
      )
      .then((r) => r.rows);
  }
  @Get("content/:kind") list(@Param("kind") kind: string) {
    return this.content.list(kindSchema.parse(kind));
  }
  @Post("content/:kind") create(
    @Param("kind") kind: string,
    @Body() body: unknown,
    @Req() req: AuthRequest,
  ) {
    return this.content.save(
      kindSchema.parse(kind),
      undefined,
      writeSchema.parse(body),
      req.session.admin_id,
    );
  }
  @Patch("content/:kind/:id") update(
    @Param("kind") kind: string,
    @Param("id") id: string,
    @Body() body: unknown,
    @Req() req: AuthRequest,
  ) {
    return this.content.save(
      kindSchema.parse(kind),
      uuid.parse(id),
      writeSchema.parse(body),
      req.session.admin_id,
    );
  }
  @Post("publish/:id") publish(
    @Param("id") id: string,
    @Body() body: unknown,
    @Req() req: AuthRequest,
  ) {
    return this.content.publish(
      uuid.parse(id),
      versionSchema.parse(body).version,
      req.session.admin_id,
    );
  }
  @Delete("content/:id") remove(
    @Param("id") id: string,
    @Body() body: unknown,
    @Req() req: AuthRequest,
  ) {
    return this.content.remove(
      uuid.parse(id),
      versionSchema.parse(body).version,
      req.session.admin_id,
    );
  }
  @Post("media")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 8 * 1024 * 1024, files: 1, fields: 0 },
    }),
  )
  async upload(
    @UploadedFile() file: { buffer: Buffer } | undefined,
    @Req() req: AuthRequest,
  ) {
    if (!file) throw new BadRequestException("Bir görsel seç.");
    let output: { data: Buffer; info: sharp.OutputInfo };
    try {
      const image = sharp(file.buffer, {
        limitInputPixels: 40000000,
        animated: false,
      });
      const metadata = await image.metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format ?? ""))
        throw new Error();
      output = await image
        .rotate()
        .resize({
          width: 2400,
          height: 2400,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 88 })
        .toBuffer({ resolveWithObject: true });
    } catch {
      throw new BadRequestException(
        "Geçerli bir JPG, PNG veya WebP görseli yükle.",
      );
    }
    const name = randomUUID() + ".webp";
    await mkdir(this.config.mediaPath, { recursive: true });
    await writeFile(join(this.config.mediaPath, name), output.data);
    await this.auth.audit(req.session.admin_id, "media.upload", name);
    return {
      url: "/managed-media/" + name,
      width: output.info.width,
      height: output.info.height,
    };
  }
}
