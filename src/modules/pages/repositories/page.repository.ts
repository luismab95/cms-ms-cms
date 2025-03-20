import { Database } from 'lib-database/src/shared/config/database';
import {
  CreatePageDto,
  GetallDto,
  PageDetailI,
  PageI,
  UpdatePageDto,
} from '../dto/page.dto';
import { Page, PageDetail } from 'lib-database/src/entities/public-api';
import { HttpException, HttpStatus } from '@nestjs/common';
import { errorQuery, queryFilter } from 'src/shared/helpers/database.helper';
import { ColumnsEnum } from 'src/shared/enums/columns.enum';
import { PaginationResponseI } from 'src/shared/interfaces/pagination.interface';
import { EntityManager } from 'typeorm';

export class PageRepository {
  async create(page: CreatePageDto, dataSource: EntityManager): Promise<PageI> {
    try {
      const pageRepository = dataSource.getRepository(Page);
      const newPage = pageRepository.create(page as Page);
      return await pageRepository.save(newPage);
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    pageId: number,
    page: UpdatePageDto,
    dataSource: EntityManager,
  ): Promise<number> {
    try {
      const update = await dataSource
        .createQueryBuilder()
        .update(Page)
        .set(page)
        .where('id = :pageId', { pageId })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async createDetails(
    pageDetail: PageDetailI,
    dataSource: EntityManager,
  ): Promise<PageDetailI> {
    try {
      const pageDetailRepository = dataSource.getRepository(PageDetail);
      const newPageDetail = pageDetailRepository.create(
        pageDetail as PageDetail,
      );
      return await pageDetailRepository.save(newPageDetail);
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async find(field: string, value: any): Promise<PageI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'p.id as "id"',
        'p.name as name',
        'p.path as path',
        'p.mongo_id as "mongoId"',
        'p.sitie_id as "sitieId"',
        'p.micrositie_id as "micrositieId"',
        'p.mode as "mode"',
        'p.is_home_page as "isHomePage"',
        'p.status as status',
        'pd.alias_ref as "aliasRef"',
        'pd.description_ref as "descriptionRef"',
        'pd.seo_keywords_ref as "seoKeywordsRef"',
      ])
      .from(Page, 'p')
      .innerJoin(PageDetail, 'pd', 'pd.page_id = p.id')
      .where(`p.${field} = :value`, { value });
    return query.getRawOne<PageI>();
  }

  async findByRender(
    code: string,
    value: any,
    sitieId: number,
    micrositieId: number | null,
  ): Promise<PageI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'p.id as "id"',
        'p.name as name',
        'p.path as path',
        'p.mongo_id as "mongoId"',
        'p.sitie_id as "sitieId"',
        'p.micrositie_id as "micrositieId"',
        'p.mode as "mode"',
        'p.is_home_page as "isHomePage"',
        'p.status as status',
        'pd.alias_ref as "aliasRef"',
        'pd.description_ref as "descriptionRef"',
        'pd.seo_keywords_ref as "seoKeywordsRef"',
      ])
      .from(Page, 'p')
      .innerJoin(PageDetail, 'pd', 'pd.page_id = p.id')
      .where(`p.${code} = :value`, { value })
      .andWhere(`p.sitie_id = :sitieId`, { sitieId });

    if (micrositieId !== null) {
      query.andWhere(`p.micrositie_id = :micrositieId`, { micrositieId });
    } else {
      query.andWhere(`p.micrositie_id IS NULL`);
    }

    return query.getRawOne<PageI>();
  }

  async get(
    paginationRequest: GetallDto,
  ): Promise<PaginationResponseI<PageI[]>> {
    const dataSource = Database.getConnection();
    let query = dataSource
      .createQueryBuilder()
      .select([
        'p.id as "id"',
        'p.name as name',
        'p.path as path',
        'p.mongo_id as "mongoId"',
        'p.sitie_id as "sitieId"',
        'p.micrositie_id as "micrositieId"',
        'p.mode as "mode"',
        'p.is_home_page as "isHomePage"',
        'p.status as status',
      ])
      .from(Page, 'p');

    query = queryFilter(
      query,
      'p',
      ['name', 'path'],
      paginationRequest.status,
      paginationRequest.search,
    );

    if (paginationRequest.micrositieId !== undefined) {
      query = query.andWhere(`p.micrositie_id = :micrositieId`, {
        micrositieId: paginationRequest.micrositieId,
      });
    } else {
      query = query.andWhere(`p.micrositie_id IS NULL`);
    }

    const total = await query.getCount();
    const records = await query
      .groupBy('p.id')
      .orderBy('p.id', 'DESC')
      .offset((paginationRequest.page - 1) * paginationRequest.limit)
      .limit(paginationRequest.limit)
      .getRawMany<PageI>();
    const totalPage = Math.ceil(total / paginationRequest.limit);

    return {
      records,
      total,
      page: Number(paginationRequest.page),
      totalPage,
    };
  }
}
