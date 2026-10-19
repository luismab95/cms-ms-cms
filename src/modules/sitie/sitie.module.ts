import { Module } from '@nestjs/common';
import { PermissionSitieRepository } from '@shared/repositories/permission-sitie.repository.js';
import { ParameterRepository } from '@shared/repositories/parameter.repository.js';
import { SitieService } from './services/sitie.service.js';
import { SitieController } from './controllers/sitie.controller.js';
import { SitieRepository } from './repositories/sitie.repository.js';

@Module({
  controllers: [SitieController],
  providers: [
    SitieService,
    SitieRepository,
    PermissionSitieRepository,
    ParameterRepository,
  ],
})
export class SitieModule {}
