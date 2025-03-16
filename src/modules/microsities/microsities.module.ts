import { Module } from '@nestjs/common';
import { MicrositiesService } from './microsities.service';
import { MicrositiesController } from './microsities.controller';
import { MicrosityRepository } from './repositories/microsities.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { PageSchema } from '../pages/schemas/page.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Page', schema: PageSchema }])],
  controllers: [MicrositiesController],
  providers: [MicrositiesService, MicrosityRepository],
})
export class MicrositiesModule {}
