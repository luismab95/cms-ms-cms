import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFileDto, UpdateFileDto } from './dto/file.dto';
import { PaginationResquestDto } from 'src/shared/interfaces/pagination.interface';
import { FileRepository } from './repositories/file.repository';
import { OK_200 } from 'src/shared/constants/message.constants';
import { getParameter } from 'src/shared/helpers/parameter.helper';

@Injectable()
export class FilesService {
  constructor(private readonly fileRepository: FileRepository) {}

  async create(createFileDto: CreateFileDto) {
    await this.fileRepository.create(createFileDto);
    return OK_200;
  }

  async findAll(paginationResquestDto: PaginationResquestDto) {
    const files = await this.fileRepository.get(paginationResquestDto);
    for (let file of files.records) {
      const path = await getParameter('APP_STATICS_URL');
      file.url = `${path}/${file.path}`;
    }
    return files;
  }

  async findOne(id: number) {
    const file = await this.fileRepository.find('id', id);
    if (file === undefined) {
      throw new HttpException(
        'No se encontro datos del archivo',
        HttpStatus.BAD_REQUEST,
      );
    }
    return file;
  }

  async update(id: number, updateFileDto: UpdateFileDto) {
    await this.findOne(id);
    await this.fileRepository.update(id, updateFileDto);
    return OK_200;
  }

  async remove(id: number) {
    const file = await this.findOne(id);
    file.status = !file.status;
    await this.fileRepository.update(id, file);
    return OK_200;
  }
}
