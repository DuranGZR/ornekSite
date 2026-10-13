import { Global, Module } from "@nestjs/common";
import { CONFIG, readConfig, type AppConfig } from "./config/config";
import { Database } from "./database/database";
import { AuthService } from "./auth/auth.service";
import { AuthGuard } from "./auth/auth.guard";
import { AuthController } from "./auth/auth.controller";
import { ContentService } from "./content/content.service";
import { ContentController } from "./content/content.controller";
@Global()
@Module({ providers: [Database], exports: [Database] })
class DatabaseModule {}
@Module({
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard],
})
class AuthModule {}
@Module({
  imports: [AuthModule],
  providers: [ContentService],
  controllers: [ContentController],
})
class ContentModule {}
export function appModule(config: AppConfig = readConfig()) {
  @Global()
  @Module({
    providers: [{ provide: CONFIG, useValue: config }],
    exports: [CONFIG],
  })
  class ConfigModule {}
  @Module({
    imports: [ConfigModule, DatabaseModule, AuthModule, ContentModule],
  })
  class AppModule {}
  return AppModule;
}
