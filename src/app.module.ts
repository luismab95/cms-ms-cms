import { Module } from '@nestjs/common';
import { Shutdown, MS_NAME, MongooseModule, config } from 'cms-lib-database';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DashboardModule } from '@modules/dashboard/dashboard.module.js';
import { ElementsModule } from '@modules/elements/elements.module.js';
import { FilesModule } from '@modules/files/files.module.js';
import { LanguagesModule } from '@modules/languages/languages.module.js';
import { MicrositiesModule } from '@modules/microsities/microsities.module.js';
import { NotifyModule } from '@modules/notify/notify.module.js';
import { PagesModule } from '@modules/pages/pages.module.js';
import { PublicModule } from '@modules/public/public.module.js';
import { SitieModule } from '@modules/sitie/sitie.module.js';
import { TemplatesModule } from '@modules/templates/templates.module.js';
import { PagesReviewModule } from '@modules/page-review/pages-review.module.js';
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
    PagesReviewModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Shutdown,
    {
      provide: MS_NAME,
      useValue: 'MS-CMS',
    },
  ],
})
export class AppModule {}
