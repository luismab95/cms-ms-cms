import { Database } from 'lib-database/src/shared/config/database';
import {
  CreateLanguageDto,
  LanguageI,
  UpdateLanguageDto,
} from '../dto/language.dto';
import { Language, Parameter } from 'lib-database/src/entities/public-api';
import { errorQuery, queryFilter } from 'src/shared/helpers/database.helper';
import { ColumnsEnum } from 'src/shared/enums/columns.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  PaginationResponseI,
  PaginationResquestDto,
} from 'src/shared/interfaces/pagination.interface';
import { EntityManager } from 'typeorm';

export class LanguageRepository {
  async create(
    language: CreateLanguageDto,
    dataSource: EntityManager,
  ): Promise<LanguageI> {
    try {
      const languageRepository = dataSource.getRepository(Language);
      const newLanguage = languageRepository.create(language as Language);
      return await languageRepository.save(newLanguage);
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    languageId: number,
    language: UpdateLanguageDto,
  ): Promise<number> {
    try {
      const dataSource = Database.getConnection();
      const update = await dataSource
        .createQueryBuilder()
        .update(Language)
        .set(language)
        .where('id = :languageId', { languageId })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async find(field: string, value: any): Promise<LanguageI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'l.id as "id"',
        'l.name as name',
        'l.lang as lang',
        'l.icon as "icon"',
        'l.status as status',
        'l.sitie_id as "sitieId"',
      ])
      .from(Language, 'l')
      .where(`l.${field} = :value`, { value });
    return query.getRawOne<LanguageI>();
  }

  async get(
    paginationRequest: PaginationResquestDto,
  ): Promise<PaginationResponseI<LanguageI[]>> {
    const dataSource = Database.getConnection();
    let query = dataSource
      .createQueryBuilder()
      .select([
        'l.id as "id"',
        'l.name as name',
        'l.lang as lang',
        'l.icon as "icon"',
        'l.status as status',
        'l.sitie_id as "sitieId"',
      ])
      .from(Language, 'l');

    query = queryFilter(
      query,
      'l',
      ['name', 'lang'],
      paginationRequest.status,
      paginationRequest.search,
    );

    const total = await query.getCount();
    const records = await query
      .groupBy('l.id')
      .orderBy('l.id', 'ASC')
      .offset((paginationRequest.page - 1) * paginationRequest.limit)
      .limit(paginationRequest.limit)
      .getRawMany<LanguageI>();
    const totalPage = Math.ceil(total / paginationRequest.limit);

    return {
      records,
      total,
      page: Number(paginationRequest.page),
      totalPage,
    };
  }

  async getAll(): Promise<LanguageI[]> {
    const dataSource = Database.getConnection();

    return await dataSource
      .createQueryBuilder()
      .select(['l.lang as lang', 'l.icon as icon'])
      .addSelect((qb) => {
        return qb
          .select('p.value')
          .from(Parameter, 'p')
          .where('p.code = :key', { key: 'APP_STATICS_URL' })
          .limit(1);
      }, 'name')
      .from(Language, 'l')
      .where('l.status = true')
      .orderBy('l.id', 'ASC')
      .getRawMany<LanguageI>()
      .then((results) => {
        return results.map((result) => {
          result.icon = result.name + result.icon;
          return result;
        });
      });
  }
}
