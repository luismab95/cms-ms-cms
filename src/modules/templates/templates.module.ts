import { Module } from '@nestjs/common';
import { MongooseModule, TemplateSchema } from 'cms-lib-database';
import { SitieRepository } from '@modules/sitie/repositories/sitie.repository.js';
import { PageReviewRepository } from '@modules/page-review/repositories/pages-review.repository.js';
import { NotifyGateway } from '@modules/notify/services/notify.gateway.js';
import { LanguageRepository } from '@modules/languages/repositories/language.repository.js';
import { TemplatesController } from './controllers/templates.controller.js';
import { TemplateRepository } from './repositories/template.repository.js';
import { TemplatesService } from './services/templates.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Template', schema: TemplateSchema },
      { name: 'ReviewTemplates', schema: TemplateSchema },
    ]),
  ],
  controllers: [TemplatesController],
  providers: [
    TemplatesService,
    TemplateRepository,
    SitieRepository,
    PageReviewRepository,
    LanguageRepository,
    NotifyGateway,
  ],
})
export class TemplatesModule {}
