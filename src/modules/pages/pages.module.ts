import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { PageRepository } from './repositories/page.repository';
import { RedisService } from 'src/shared/redis/redis.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PageSchema } from './schemas/page.schema';
import { ReferenceRepository } from 'src/shared/repositories/reference.repository';
import { LanguageRepository } from '../languages/repositories/language.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Page', schema: PageSchema }])],
  controllers: [PagesController],
  providers: [
    PagesService,
    PageRepository,
    RedisService,
    ReferenceRepository,
    LanguageRepository,
  ],
})
export class PagesModule {}
