import { Module } from '@nestjs/common';
import { MongooseModule, PageSchema } from 'cms-lib-database';
import { ParameterRepository } from '@shared/repositories/parameter.repository.js';
import { PermissionSitieRepository } from '@shared/repositories/permission-sitie.repository.js';
import { MicrositiesController } from './controllers/microsities.controller.js';
import { MicrosityRepository } from './repositories/microsities.repository.js';
import { MicrositiesService } from './services/microsities.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Page', schema: PageSchema }])],
  controllers: [MicrositiesController],
  providers: [
    MicrositiesService,
    MicrosityRepository,
    PermissionSitieRepository,
    ParameterRepository,
  ],
})
export class MicrositiesModule {}
