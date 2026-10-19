import { Module } from '@nestjs/common';
import { MongooseModule, TemplateSchema } from 'cms-lib-database';
import { SitieRepository } from '@modules/sitie/repositories/sitie.repository.js';
import { TemplatesController } from './controllers/templates.controller.js';
import { TemplateRepository } from './repositories/template.repository.js';
import { TemplatesService } from './services/templates.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Template', schema: TemplateSchema }]),
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService, TemplateRepository, SitieRepository],
})
export class TemplatesModule {}
