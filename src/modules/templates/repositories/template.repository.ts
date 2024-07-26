import { Database } from 'lib-database/src/shared/config/database';
import {
  CreateTemplateDto,
  TemplateI,
  UpdateTemplateDto,
} from '../dto/template.dto';
import { Template } from 'lib-database/src/entities/public-api';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ColumnsEnum } from 'src/shared/enums/columns.enum';
import { errorQuery, queryFilter } from 'src/shared/helpers/database.helper';
import {
  PaginationResquestDto,
  PaginationResponseI,
} from 'src/shared/interfaces/pagination.interface';

export class TemplateRepository {
  async create(template: CreateTemplateDto): Promise<TemplateI> {
    try {
      const dataSource = Database.getConnection();
      const templateRepository = dataSource.getRepository(Template);
      const newTemplate = templateRepository.create(template as Template);
      return await templateRepository.save(newTemplate);
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    templateId: number,
    template: UpdateTemplateDto,
  ): Promise<number> {
    try {
      const dataSource = Database.getConnection();
      const update = await dataSource
        .createQueryBuilder()
        .update(Template)
        .set(template)
        .where('id = :templateId', { templateId })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async find(field: string, value: any): Promise<TemplateI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        't.id as "id"',
        't.name as name',
        't.description as description',
        't.mongo_id as "mongoId"',
        't.status as status',
      ])
      .from(Template, 't')
      .where(`t.${field} = :value`, { value });
    return query.getRawOne<TemplateI>();
  }

  async get(
    paginationRequest: PaginationResquestDto,
  ): Promise<PaginationResponseI<TemplateI[]>> {
    const dataSource = Database.getConnection();
    let query = dataSource
      .createQueryBuilder()
      .select([
        't.id as "id"',
        't.name as name',
        't.description as description',
        't.mongo_id as "mongoId"',
        't.status as status',
      ])
      .from(Template, 't');

    query = queryFilter(
      query,
      't',
      ['name', 'description'],
      paginationRequest.status,
      paginationRequest.search,
    );

    const total = await query.getCount();
    const records = await query
      .groupBy('t.id')
      .orderBy('t.id', 'DESC')
      .offset((paginationRequest.page - 1) * paginationRequest.limit)
      .limit(paginationRequest.limit)
      .getRawMany<TemplateI>();
    const totalPage = Math.ceil(total / paginationRequest.limit);

    return {
      records,
      total,
      page: Number(paginationRequest.page),
      totalPage,
    };
  }
}
