import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import {
  Catch,
  HttpException,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import {
  json,
  static as serveStatic,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { ZodError } from "zod";
import { join, resolve } from "node:path";
import { appModule } from "./app";
import { type AppConfig } from "./config/config";
@Catch()
class Errors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    if (error instanceof ZodError) {
      res.status(400).json({
        message: error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("\n"),
      });
      return;
    }
    if (error instanceof HttpException) {
      res.status(error.getStatus()).json(error.getResponse());
      return;
    }
    console.error(
      "İşlem başarısız:",
      error instanceof Error ? error.name : "UnknownError",
    );
    res.status(500).json({ message: "İşlem tamamlanamadı. Tekrar dene." });
  }
}
export async function createApp(config: AppConfig, silent = false) {
  const app = await NestFactory.create(appModule(config), {
    bodyParser: false,
    logger: silent ? false : ["error", "warn", "log"],
  });
  const express = app.getHttpAdapter().getInstance();
  express.disable("x-powered-by");
  express.set(
    "trust proxy",
    config.TRUST_PROXY === "loopback" ? "loopback" : false,
  );
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "https:", "data:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: config.production ? [] : null,
        },
      },
      hsts: config.production ? undefined : false,
    }),
  );
  app.use(cookieParser());
  app.use("/api", (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", "no-store");
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      if (req.get("Origin") !== config.origin) {
        res.status(403).json({ message: "İstek kaynağı doğrulanamadı." });
        return;
      }
      if (
        !req.is("application/json") &&
        !(req.path === "/admin/media" && req.is("multipart/form-data"))
      ) {
        res.status(415).json({ message: "Geçersiz içerik türü." });
        return;
      }
    }
    next();
  });
  app.use(json({ limit: "256kb" }));
  app.use(
    "/managed-media",
    serveStatic(config.mediaPath, { dotfiles: "deny", index: false }),
  );
  app.use(
    "/community",
    serveStatic(resolve("../frontend/public/community"), {
      dotfiles: "deny",
      index: false,
    }),
  );
  const assets = resolve("admin/dist");
  app.use(
    "/photos",
    serveStatic(resolve("../frontend/public/photos"), {
      dotfiles: "deny",
      index: false,
    }),
  );
  app.use("/hsd-logo.svg", (_req: Request, res: Response) =>
    res.sendFile(resolve("../frontend/public/hsd-logo.svg")),
  );
  app.use(serveStatic(assets, { index: false, dotfiles: "deny" }));
  // Serve the separate admin application only outside API routes.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (
      req.method === "GET" &&
      !req.path.startsWith("/api/") &&
      !req.path.startsWith("/managed-media/")
    )
      res.sendFile(join(assets, "index.html"));
    else next();
  });
  app.useGlobalFilters(new Errors());
  app.enableShutdownHooks();
  await app.init();
  return app;
}
