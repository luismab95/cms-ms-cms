import { Module } from '@nestjs/common';
import { ParameterRepository } from '@shared/repositories/parameter.repository.js';
import { FilesController } from './controllers/files.controller.js';
import { FileRepository } from './repositories/file.repository.js';
import { FilesService } from './services/files.service.js';

@Module({
  controllers: [FilesController],
  providers: [FilesService, FileRepository, ParameterRepository],
})
export class FilesModule {}
