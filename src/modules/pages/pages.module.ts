import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { PageRepository } from './repositories/page.repository';
import { RedisService } from 'src/shared/redis/redis.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PageSchema } from './schemas/page.schema';
import { ReferenceRepository } from 'src/shared/repositories/reference.repository';
import { LanguageRepository } from '../languages/repositories/language.repository';
import { VisitSchema } from '../dashboard/schemas/visit.schema';
import { NotifyRepository } from 'src/modules/notify/repositories/notify.repository';
import { NotifyGateway } from '../notify/notify.gateway';

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
    RedisService,
    ReferenceRepository,
    LanguageRepository,
    NotifyRepository,
    NotifyGateway
  ],
})
export class PagesModule {}
