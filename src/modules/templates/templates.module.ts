import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { TemplateRepository } from './repositories/template.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateSchema } from './schemas/template.schema';
import { SitieRepository } from '../sitie/repositories/sitie.repository';
import { RedisService } from 'src/shared/redis/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Template', schema: TemplateSchema }]),
  ],
  controllers: [TemplatesController],
  providers: [
    TemplatesService,
    TemplateRepository,
    SitieRepository,
    RedisService,
  ],
})
export class TemplatesModule {}
