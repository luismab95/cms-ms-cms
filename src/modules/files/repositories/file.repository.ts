import { Database } from 'lib-database/src/shared/config/database';
import { File as FileEntity } from 'lib-database/src/entities/public-api';
import { CreateFileDto, FileI, UpdateFileDto } from '../dto/file.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { errorQuery, queryFilter } from 'src/shared/helpers/database.helper';
import { ColumnsEnum } from 'src/shared/enums/columns.enum';
import {
  PaginationResponseI,
  PaginationResquestDto,
} from 'src/shared/interfaces/pagination.interface';

export class FileRepository {
  async create(file: CreateFileDto): Promise<FileI> {
    try {
      const dataSource = Database.getConnection();
      const fileRepository = dataSource.getRepository(FileEntity);
      const newFile = fileRepository.create(file as FileEntity);
      return await fileRepository.save(newFile);
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async update(fileId: number, file: UpdateFileDto): Promise<number> {
    try {
      const dataSource = Database.getConnection();
      const update = await dataSource
        .createQueryBuilder()
        .update(FileEntity)
        .set(file)
        .where('id = :fileId', { fileId })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async find(field: string, value: any): Promise<FileI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'f.id as "id"',
        'f.name as name',
        'f.description as description',
        'f.mime_type as "mimeType"',
        'f.size as size',
        'f.filename as "filename"',
        'f.status as status',
        'f.path as "path"',
      ])
      .from(FileEntity, 'f')
      .where(`f.${field} = :value`, { value });
    return query.getRawOne<FileI>();
  }

  async get(
    paginationRequest: PaginationResquestDto,
  ): Promise<PaginationResponseI<FileI[]>> {
    const dataSource = Database.getConnection();
    let query = dataSource
      .createQueryBuilder()
      .select([
        'f.id as "id"',
        'f.name as name',
        'f.description as description',
        'f.mime_type as "mimeType"',
        'f.size as size',
        'f.filename as "filename"',
        'f.status as status',
        'f.path as "path"',
      ])
      .from(FileEntity, 'f');

    query = queryFilter(
      query,
      'f',
      ['name', 'description', 'filename', 'path', 'mime_type'],
      paginationRequest.status,
      paginationRequest.search,
    );

    const total = await query.getCount();
    const records = await query
      .groupBy('f.id')
      .orderBy('f.id', 'DESC')
      .offset((paginationRequest.page - 1) * paginationRequest.limit)
      .limit(paginationRequest.limit)
      .getRawMany<FileI>();
    const totalPage = Math.ceil(total / paginationRequest.limit);

    return {
      records,
      total,
      page: Number(paginationRequest.page),
      totalPage,
    };
  }
}
