import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesModule } from './modules/files/files.module';
import { SitieModule } from './modules/sitie/sitie.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './shared/environments/load-env';
import { MicrositiesModule } from './modules/microsities/microsities.module';
import { RedisService } from './shared/redis/redis.service';
import { PagesModule } from './modules/pages/pages.module';
import { ElementsModule } from './modules/elements/elements.module';
import { PublicModule } from './modules/public/public.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotifyModule } from './modules/notify/notify.module';
const { mongoUri } = config.server;
@Module({
  imports: [
    MongooseModule.forRoot(`${mongoUri}`),
    FilesModule,
    MicrositiesModule,
    SitieModule,
    LanguagesModule,
    TemplatesModule,
    PagesModule,
    ElementsModule,
    PublicModule,
    DashboardModule,
    NotifyModule,
  ],
  controllers: [AppController],
  providers: [AppService, RedisService],
})
export class AppModule {}
