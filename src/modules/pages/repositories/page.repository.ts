import { HttpException, HttpStatus } from '@nestjs/common';
import {
  EntityManager,
  Page,
  PageDetail,
  Database,
  PermissionSitie,
  PageReviewStatus,
  PageReview,
  Micrositie,
} from 'cms-lib-database';
import {
  errorQuery,
  ColumnsEnum,
  PaginationResponseI,
  queryFilter,
} from 'cms-lib-resources';
import {
  CreatePageDto,
  PageI,
  UpdatePageDto,
  PageDetailI,
  GetallDto,
  PageReviewI,
  ReviewPageDto,
  PageReviewDataI,
} from '../dto/page.dto.js';

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
    let query = dataSource
      .createQueryBuilder()
      .select([
        'p.id as "id"',
        'p.name as name',
        'p.path as path',
        'p.mongo_id as "mongoId"',
        'p.sitie_id as "sitieId"',
        'p.micrositie_id as "micrositieId"',
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
    userId: number,
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
        'p.is_home_page as "isHomePage"',
        'p.status as status',
      ])
      .from(Page, 'p');

    if (paginationRequest.micrositieId === undefined) {
      query = query.innerJoin(
        PermissionSitie,
        'ps',
        'ps.sitie_id = p.sitie_id and ps.user_id = :userId and ps.status = :status',
        { userId, status: true },
      );
    } else {
      query = query.innerJoin(
        PermissionSitie,
        'pm',
        'pm.micrositie_id = p.micrositie_id and pm.user_id = :userId and pm.status = :status',
        { userId, status: true },
      );
    }

    query = queryFilter(
      query,
      'p',
      ['name', 'path'],
      paginationRequest.status!,
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

  async findPageReview(
    pageId: number,
    status: PageReviewStatus,
  ): Promise<PageReviewI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'pr.id as "id"',
        'pr.mongo_id as "mongoId"',
        'pr.page_id as "pageId"',
        'pr.user_id as "userId"',
        'pr.comment as "comment"',
        'pr.status as "status"',
      ])
      .from(PageReview, 'pr')
      .where(`pr.pageId = :pageId`, { pageId })
      .andWhere('pr.status = :status', { status })
      .orderBy('pr.id', 'DESC');

    return query.getRawOne<PageReviewI>();
  }

  async findLastPageReview(pageId: number): Promise<PageReviewI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'pr.id as "id"',
        'pr.mongo_id as "mongoId"',
        'pr.page_id as "pageId"',
        'pr.user_id as "userId"',
        'pr.comment as "comment"',
        'pr.status as "status"',
      ])
      .from(PageReview, 'pr')
      .where(`pr.pageId = :pageId`, { pageId })
      .orderBy('pr.id', 'DESC');

    return query.getRawOne<PageReviewI>();
  }

  async createReviewPage(
    reviewPage: PageReviewI,
    dataSource: EntityManager,
  ): Promise<PageReviewI> {
    try {
      const pageReviewRepository = dataSource.getRepository(PageReview);
      const newPage = pageReviewRepository.create(reviewPage as PageReview);
      return await pageReviewRepository.save(newPage);
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async updateReviewPage(
    id: number,
    reviewPage: ReviewPageDto,
  ): Promise<number> {
    try {
      const dataSource = Database.getConnection();
      const update = await dataSource
        .createQueryBuilder()
        .update(PageReview)
        .set({ comment: reviewPage.comment, status: reviewPage.status })
        .where('id = :id', { id })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async getForReview(
    paginationRequest: GetallDto,
  ): Promise<PaginationResponseI<PageReviewDataI[]>> {
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
        'p.is_home_page as "isHomePage"',
        'p.status as status',
        'pr.id as "reviewId"',
        'pr.comment as "reviewComment"',
        'pr.status as "reviewStatus"',
        'pr.mongo_id as "reviewMongoId"',
        'ms.name as "micrositieName"',
      ])
      .from(Page, 'p')
      .innerJoin(PageReview, 'pr', 'pr.page_id = p.id')
      .leftJoin(Micrositie, 'ms', 'ms.id = p.micrositie_id');

    query = queryFilter(
      query,
      'p',
      ['name', 'path'],
      paginationRequest.status!,
      paginationRequest.search,
    );

    query.andWhere('pr.status = :statusReview', { statusReview: 'pending' });

    const total = await query.getCount();
    const records = await query
      .groupBy('p.id')
      .addGroupBy('pr.id')
      .addGroupBy('ms.name')
      .orderBy('p.id', 'DESC')
      .offset((paginationRequest.page - 1) * paginationRequest.limit)
      .limit(paginationRequest.limit)
      .getRawMany<PageReviewDataI>();
    const totalPage = Math.ceil(total / paginationRequest.limit);

    return {
      records,
      total,
      page: Number(paginationRequest.page),
      totalPage,
    };
  }

  async findForReview(id: number): Promise<PageReviewDataI | undefined> {
    const dataSource = Database.getConnection();
    return await dataSource
      .createQueryBuilder()
      .select([
        'p.id as "id"',
        'p.name as name',
        'p.path as path',
        'p.mongo_id as "mongoId"',
        'p.sitie_id as "sitieId"',
        'p.micrositie_id as "micrositieId"',
        'p.is_home_page as "isHomePage"',
        'p.status as status',
        'pr.id as "reviewId"',
        'pr.comment as "reviewComment"',
        'pr.status as "reviewStatus"',
        'pr.mongo_id as "reviewMongoId"',
        'ms.name as "micrositieName"',
      ])
      .from(Page, 'p')
      .innerJoin(PageReview, 'pr', 'pr.page_id = p.id')
      .leftJoin(Micrositie, 'ms', 'ms.id = p.micrositie_id')
      .where('pr.status = :status', { status: 'pending' })
      .andWhere('p.id = :id', { id })
      .getRawOne<PageReviewDataI>();
  }

  async findReview(id: number): Promise<PageReviewDataI | undefined> {
    const dataSource = Database.getConnection();
    return await dataSource
      .createQueryBuilder()
      .select([
        'pr.page_id as "id"',
        'p.mongo_id as "mongoId"',
        'p.name as "name"',
        'p.micrositie_id as "micrositieId"',
        'pr.id as "reviewId"',
        'pr.comment as "reviewComment"',
        'pr.status as "reviewStatus"',
        'pr.mongo_id as "reviewMongoId"',
      ])
      .from(PageReview, 'pr')
      .innerJoin(Page, 'p', 'p.id = pr.page_id')
      .where('pr.id = :id', { id })
      .getRawOne<PageReviewDataI>();
  }
}
