import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { LanguagesService } from '../languages/languages.service';
import { LanguageRepository } from '../languages/repositories/language.repository';
import { PageRepository } from '../pages/repositories/page.repository';
import { RedisService } from 'src/shared/redis/redis.service';
import { PagesService } from '../pages/pages.service';
import { ReferenceRepository } from 'src/shared/repositories/reference.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { PageSchema } from '../pages/schemas/page.schema';
import { SitieService } from '../sitie/sitie.service';
import { MicrositiesService } from '../microsities/microsities.service';
import { SitieRepository } from '../sitie/repositories/sitie.repository';
import { MicrosityRepository } from '../microsities/repositories/microsities.repository';
import { TemplateRepository } from '../templates/repositories/template.repository';
import { TemplatesService } from '../templates/templates.service';
import { TemplateSchema } from '../templates/schemas/template.schema';
import { VisitSchema } from '../dashboard/schemas/visit.schema';
import { NotifyRepository } from 'src/modules/notify/repositories/notify.repository';
import { NotifyGateway } from '../notify/notify.gateway';

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
    RedisService,
    ReferenceRepository,
    SitieService,
    MicrositiesService,
    SitieRepository,
    MicrosityRepository,
    TemplatesService,
    TemplateRepository,
    NotifyRepository,
    NotifyGateway
  ],
})
export class PublicModule {}
