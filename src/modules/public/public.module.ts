import { Module } from '@nestjs/common';
import {
  MongooseModule,
  PageSchema,
  TemplateSchema,
  VisitSchema,
} from 'cms-lib-database';
import { LanguageRepository } from '@modules/languages/repositories/language.repository.js';
import { LanguagesService } from '@modules/languages/services/languages.service.js';
import { MicrosityRepository } from '@modules/microsities/repositories/microsities.repository.js';
import { MicrositiesService } from '@modules/microsities/services/microsities.service.js';
import { NotifyGateway } from '@modules/notify/services/notify.gateway.js';
import { NotifyRepository } from '@modules/notify/repositories/notify.repository.js';
import { PageRepository } from '@modules/pages/repositories/page.repository.js';
import { PagesService } from '@modules/pages/services/pages.service.js';
import { SitieRepository } from '@modules/sitie/repositories/sitie.repository.js';
import { SitieService } from '@modules/sitie/services/sitie.service.js';
import { TemplateRepository } from '@modules/templates/repositories/template.repository.js';
import { TemplatesService } from '@modules/templates/services/templates.service.js';
import { PermissionSitieRepository } from '@shared/repositories/permission-sitie.repository.js';
import { ReferenceRepository } from '@shared/repositories/reference.repository.js';
import { ParameterRepository } from '@shared/repositories/parameter.repository.js';
import { PublicController } from './controllers/public.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Page', schema: PageSchema }]),
    MongooseModule.forFeature([{ name: 'Template', schema: TemplateSchema }]),
    MongooseModule.forFeature([{ name: 'Visit', schema: VisitSchema }]),
    MongooseModule.forFeature([{ name: 'Review', schema: PageSchema }]),
  ],
  controllers: [PublicController],
  providers: [
    LanguagesService,
    LanguageRepository,
    PagesService,
    PageRepository,
    ReferenceRepository,
    SitieService,
    MicrositiesService,
    SitieRepository,
    MicrosityRepository,
    PermissionSitieRepository,
    TemplatesService,
    TemplateRepository,
    NotifyRepository,
    NotifyGateway,
    ParameterRepository
  ],
})
export class PublicModule {}
