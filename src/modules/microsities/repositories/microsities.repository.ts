import { Database } from 'lib-database/src/shared/config/database';
import {
  CreateMicrosityDto,
  MicrositieI,
  UpdateMicrosityDto,
} from '../dto/microsity.dto';
import { errorQuery, queryFilter } from 'src/shared/helpers/database.helper';
import { ColumnsEnum } from 'src/shared/enums/columns.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Micrositie } from 'lib-database/src/entities/public-api';
import {
  PaginationResponseI,
  PaginationResquestDto,
} from 'src/shared/interfaces/pagination.interface';
import { EntityManager } from 'typeorm';

export class MicrosityRepository {
  async create(
    microsity: CreateMicrosityDto,
    dataSource: EntityManager,
  ): Promise<MicrositieI> {
    try {
      const microsityRepository = dataSource.getRepository(Micrositie);
      const newLanguage = microsityRepository.create(microsity as Micrositie);
      return await microsityRepository.save(newLanguage);
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    microsityId: number,
    microsity: UpdateMicrosityDto,
  ): Promise<number> {
    try {
      const dataSource = Database.getConnection();
      const update = await dataSource
        .createQueryBuilder()
        .update(Micrositie)
        .set(microsity)
        .where('id = :microsityId', { microsityId })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async find(field: string, value: any): Promise<MicrositieI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'm.id as "id"',
        'm.name as name',
        'm.description as description',
        'm.path as "path"',
        'm.status as status',
        'm.sitie_id as "sitieId"',
      ])
      .from(Micrositie, 'm')
      .where(`m.${field} = :value`, { value });
    return query.getRawOne<MicrositieI>();
  }

  async get(
    paginationRequest: PaginationResquestDto,
  ): Promise<PaginationResponseI<MicrositieI[]>> {
    const dataSource = Database.getConnection();
    let query = dataSource
      .createQueryBuilder()
      .select([
        'm.id as "id"',
        'm.name as name',
        'm.description as description',
        'm.path as "path"',
        'm.status as status',
        'm.sitie_id as "sitieId"',
      ])
      .from(Micrositie, 'm');

    query = queryFilter(
      query,
      'm',
      ['name', 'description', 'path'],
      paginationRequest.status,
      paginationRequest.search,
    );

    const total = await query.getCount();
    const records = await query
      .groupBy('m.id')
      .orderBy('m.id', 'DESC')
      .offset((paginationRequest.page - 1) * paginationRequest.limit)
      .limit(paginationRequest.limit)
      .getRawMany<MicrositieI>();
    const totalPage = Math.ceil(total / paginationRequest.limit);

    return {
      records,
      total,
      page: Number(paginationRequest.page),
      totalPage,
    };
  }
}
