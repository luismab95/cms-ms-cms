import { Module } from '@nestjs/common';
import { MongooseModule, PageSchema, VisitSchema } from 'cms-lib-database';
import { LanguageRepository } from '@modules/languages/repositories/language.repository.js';
import { NotifyGateway } from '@modules/notify/services/notify.gateway.js';
import { NotifyRepository } from '@modules/notify/repositories/notify.repository.js';
import { PageReviewRepository } from '@modules/page-review/repositories/pages-review.repository.js';
import { ReferenceRepository } from '@shared/repositories/reference.repository.js';
import { PermissionSitieRepository } from '@shared/repositories/permission-sitie.repository.js';
import { PagesController } from './controllers/pages.controller.js';
import { PageRepository } from './repositories/page.repository.js';
import { PagesService } from './services/pages.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Page', schema: PageSchema }]),
    MongooseModule.forFeature([{ name: 'Visit', schema: VisitSchema }]),
    MongooseModule.forFeature([{ name: 'Review', schema: PageSchema }]),
  ],
  controllers: [PagesController],
  providers: [
    PagesService,
    PageRepository,
    ReferenceRepository,
    LanguageRepository,
    NotifyRepository,
    PageReviewRepository,
    PermissionSitieRepository,
    NotifyGateway
  ],
})
export class PagesModule {}
