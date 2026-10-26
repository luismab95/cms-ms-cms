import { HttpException, HttpStatus } from '@nestjs/common';
import {
  Database,
  Template,
  PermissionSitie,
  EntityManager,
  Sitie,
  Micrositie,
} from 'cms-lib-database';
import {
  errorQuery,
  ColumnsEnum,
  PaginationResquestDto,
  PaginationResponseI,
  queryFilter,
} from 'cms-lib-resources';
import {
  CreateTemplateDto,
  TemplateI,
  UpdateTemplateDto,
} from '../dto/template.dto.js';

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
    dataSource: EntityManager,
  ): Promise<number> {
    try {
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

  async findActives(templateId: number): Promise<TemplateI[]> {
    const dataSource = Database.getConnection();
    const querySities = dataSource
      .createQueryBuilder()
      .select(['s.name as "nameEntity"'])
      .from(Template, 't')
      .innerJoin(
        Sitie,
        's',
        's.template_id = :templateId and s.status = :status',
        { templateId, status: true },
      )
      .where(`t.id = :templateId`, { templateId });

    const queryMicrosities = dataSource
      .createQueryBuilder()
      .select(['ms.name as "nameEntity"'])
      .from(Template, 't')
      .innerJoin(
        Sitie,
        's',
        's.template_id = :templateId and s.status = :status',
        { templateId, status: true },
      )
      .innerJoin(
        Micrositie,
        'ms',
        'ms.template_id = :templateId and ms.status = :status',
        {
          templateId,
          status: true,
        },
      )
      .where(`t.id = :templateId`, { templateId });

    const sities = await querySities.getRawMany<TemplateI>();
    const microsities = await queryMicrosities.getRawMany<TemplateI>();

    return [...sities, ...microsities];
  }

  async get(
    paginationRequest: PaginationResquestDto,
    userId: number,
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

    query = query.innerJoin(
      PermissionSitie,
      'pm',
      'pm.sitie_id IS NOT NULL AND pm.status = :status AND pm.user_id = :userId',
      { userId, status: true },
    );

    query = queryFilter(
      query,
      't',
      ['name', 'description'],
      paginationRequest.status!,
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
