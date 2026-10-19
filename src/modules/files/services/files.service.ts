import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OK_200, getParameter } from 'cms-lib-resources';
import { ParameterRepository } from '@shared/repositories/parameter.repository.js';
import {
  CreateFileDto,
  PaginationFileResquestDto,
  UpdateFileDto,
} from '../dto/file.dto.js';
import { FileRepository } from '../repositories/file.repository.js';

@Injectable()
export class FilesService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly parameterRepository: ParameterRepository,
  ) {}

  async create(createFileDto: CreateFileDto) {
    await this.fileRepository.create(createFileDto);
    return OK_200;
  }

  async findAll(paginationResquestDto: PaginationFileResquestDto) {
    const parameters = this.parameterRepository.getParameters();
    const files = await this.fileRepository.get(paginationResquestDto);
    for (let file of files.records) {
      const path = await getParameter(
        (await parameters).find((p) => p.code === 'APP_STATICS_URL'),
        'APP_STATICS_URL',
      );
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
