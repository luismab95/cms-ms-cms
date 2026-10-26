import { Module } from '@nestjs/common';
import {
  MongooseModule,
  PageSchema,
  TemplateSchema,
  VisitSchema,
} from 'cms-lib-database';
import { PagesService } from '@modules/pages/services/pages.service.js';
import { LanguageRepository } from '@modules/languages/repositories/language.repository.js';
import { NotifyGateway } from '@modules/notify/services/notify.gateway.js';
import { PageRepository } from '@modules/pages/repositories/page.repository.js';
import { TemplatesService } from '@modules/templates/services/templates.service.js';
import { ReferenceRepository } from '@shared/repositories/reference.repository.js';
import { TemplateRepository } from '@modules/templates/repositories/template.repository.js';
import { SitieRepository } from '@modules/sitie/repositories/sitie.repository.js';
import { PagesReviewController } from './controllers/pages-review.controller.js';
import { PagesReviewService } from './services/pages-review.service.js';
import { PageReviewRepository } from './repositories/pages-review.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Template', schema: TemplateSchema },
      { name: 'Page', schema: PageSchema },
      { name: 'ReviewPages', schema: PageSchema },
      { name: 'Visit', schema: VisitSchema },
      { name: 'ReviewTemplates', schema: TemplateSchema },
    ]),
  ],
  controllers: [PagesReviewController],
  providers: [
    PagesReviewService,
    PageReviewRepository,
    PagesService,
    TemplatesService,
    PageRepository,
    TemplateRepository,
    SitieRepository,
    ReferenceRepository,
    LanguageRepository,
    PageReviewRepository,
    NotifyGateway,
  ],
})
export class PagesReviewModule {}
