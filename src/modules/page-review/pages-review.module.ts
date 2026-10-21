import { Module } from '@nestjs/common';
import { MongooseModule, PageSchema, VisitSchema } from 'cms-lib-database';
import { PagesService } from '@modules/pages/services/pages.service.js';
import { LanguageRepository } from '@modules/languages/repositories/language.repository.js';
import { NotifyRepository } from '@modules/notify/repositories/notify.repository.js';
import { NotifyGateway } from '@modules/notify/services/notify.gateway.js';
import { PageRepository } from '@modules/pages/repositories/page.repository.js';
import { ReferenceRepository } from '@shared/repositories/reference.repository.js';
import { PermissionSitieRepository } from '@shared/repositories/permission-sitie.repository.js';
import { PagesReviewController } from './controllers/pages-review.controller.js';
import { PagesReviewService } from './services/pages-review.service.js';
import { PageReviewRepository } from './repositories/pages-review.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Page', schema: PageSchema }]),
    MongooseModule.forFeature([{ name: 'Visit', schema: VisitSchema }]),
    MongooseModule.forFeature([{ name: 'Review', schema: PageSchema }]),
  ],
  controllers: [PagesReviewController],
  providers: [
    PagesReviewService,
    PageReviewRepository,
    PagesService,
    PageRepository,
    ReferenceRepository,
    LanguageRepository,
    NotifyRepository,
    PageReviewRepository,
    PermissionSitieRepository,
    NotifyGateway,
  ],
})
export class PagesReviewModule {}
