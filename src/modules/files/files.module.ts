import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileRepository } from './repositories/file.repository';

@Module({
  controllers: [FilesController],
  providers: [FilesService, FileRepository],
})
export class FilesModule {}
