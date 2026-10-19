import { HttpException, HttpStatus } from '@nestjs/common';
import { Database, File as FileEntity, Brackets } from 'cms-lib-database';
import {
  errorQuery,
  ColumnsEnum,
  PaginationResponseI,
  queryFilter,
} from 'cms-lib-resources';
import {
  CreateFileDto,
  FileI,
  UpdateFileDto,
  PaginationFileResquestDto,
} from '../dto/file.dto.js';

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
    paginationRequest: PaginationFileResquestDto,
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
      ['name', 'description', 'filename', 'path'],
      paginationRequest.status!,
      paginationRequest.search,
    );

    if (
      paginationRequest.mimeType !== null &&
      paginationRequest.mimeType !== undefined
    ) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where(`upper(f.mime_type) like :mimeType`, {
            mimeType: `%${paginationRequest.mimeType?.toUpperCase()}%`,
          });
        }),
      );
    }

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
