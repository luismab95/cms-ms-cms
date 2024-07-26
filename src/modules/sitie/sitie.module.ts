import { Module } from '@nestjs/common';
import { SitieService } from './sitie.service';
import { SitieController } from './sitie.controller';
import { SitieRepository } from './repositories/sitie.repository';

@Module({
  controllers: [SitieController],
  providers: [SitieService, SitieRepository],
})
export class SitieModule {}
