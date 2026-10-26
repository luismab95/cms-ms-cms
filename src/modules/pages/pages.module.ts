import { Module } from '@nestjs/common';
import { MongooseModule, PageSchema, VisitSchema } from 'cms-lib-database';
import { LanguageRepository } from '@modules/languages/repositories/language.repository.js';
import { NotifyGateway } from '@modules/notify/services/notify.gateway.js';
import { PageReviewRepository } from '@modules/page-review/repositories/pages-review.repository.js';
import { ReferenceRepository } from '@shared/repositories/reference.repository.js';
import { PagesController } from './controllers/pages.controller.js';
import { PageRepository } from './repositories/page.repository.js';
import { PagesService } from './services/pages.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Page', schema: PageSchema },
      { name: 'Visit', schema: VisitSchema },
      { name: 'ReviewPages', schema: PageSchema },
    ]),
  ],
  controllers: [PagesController],
  providers: [
    PagesService,
    PageRepository,
    ReferenceRepository,
    LanguageRepository,
    PageReviewRepository,
    NotifyGateway,
  ],
})
export class PagesModule {}
