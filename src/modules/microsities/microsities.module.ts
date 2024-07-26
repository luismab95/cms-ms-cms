import { Module } from '@nestjs/common';
import { MicrositiesService } from './microsities.service';
import { MicrositiesController } from './microsities.controller';
import { MicrosityRepository } from './repositories/microsities.repository';

@Module({
  controllers: [MicrositiesController],
  providers: [MicrositiesService, MicrosityRepository],
})
export class MicrositiesModule {}
