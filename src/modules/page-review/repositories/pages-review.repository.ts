import { HttpException, HttpStatus } from '@nestjs/common';
import {
  EntityManager,
  Page,
  Database,
  PermissionSitie,
  PageReview,
  Micrositie,
  User,
  DataSource,
  TypeReviewT,
  Template,
  Brackets,
} from 'cms-lib-database';
import {
  errorQuery,
  ColumnsEnum,
  PaginationResponseI,
} from 'cms-lib-resources';
import { ReviewPageDataI, GetallDto } from '../dto/page-review.dto.js';

export class PageReviewRepository {
  async findPageReview(
    entityId: number,
    typeReview: TypeReviewT,
    dataSource: EntityManager | null | DataSource,
  ): Promise<ReviewPageDataI | undefined> {
    if (dataSource === null) dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'pr.id as "id"',
        'pr.mongo_id as "mongoId"',
        'pr.page_id as "pageId"',
        `pr.template_id AS "templateId"`,
        'pr.comment as "comment"',
        'pr.comments as "comments"',
        'pr.status_review as "statusReview"',
        'pr.type as "type"',
        'uc.id as "userChangesId"',
        'ur.id as "userReviewId"',
        `CONCAT(uc.firstname, ' ', uc.lastname) as "userChanges"`,
        `CONCAT(ur.firstname, ' ', ur.lastname) as "userReview"`,
      ])
      .from(PageReview, 'pr')
      .innerJoin(User, 'uc', 'uc.id = pr.user_changes_id')
      .leftJoin(User, 'ur', 'ur.id = pr.user_review_id')
      .where('pr.type = :typeReview', { typeReview });

    if (typeReview === 'page') {
      query.andWhere(`pr.page_id = :pageId`, { pageId: entityId });
    }

    if (typeReview === 'template') {
      query.andWhere(`pr.template_id = :templateId`, { templateId: entityId });
    }

    query.orderBy('pr.id', 'DESC');

    return query.getRawOne<ReviewPageDataI>();
  }

  async createReviewPage(
    reviewPage: ReviewPageDataI,
    dataSource: EntityManager,
  ): Promise<ReviewPageDataI> {
    try {
      const pageReviewRepository = dataSource.getRepository(PageReview);
      const { pageId, statusReview, userChangesId, mongoId, type, templateId } =
        reviewPage;
      const newPageReview = {
        mongoId,
        comment: '',
        statusReview,
        pageId,
        templateId,
        type,
        userChangesId,
      } as PageReview;
      return (await pageReviewRepository.save(
        newPageReview,
      )) as unknown as ReviewPageDataI;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async updateReviewPage(
    id: number,
    reviewPage: ReviewPageDataI,
    dataSource: EntityManager,
  ): Promise<number> {
    try {
      const update = await dataSource
        .createQueryBuilder()
        .update(PageReview)
        .set({ ...reviewPage } as unknown as PageReview)
        .where('id = :id', { id })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async getAll(
    paginationRequest: GetallDto,
    userId: number,
  ): Promise<PaginationResponseI<ReviewPageDataI[]>> {
    const dataSource = Database.getConnection();
    let query = dataSource
      .createQueryBuilder()
      .select([
        `CASE
          WHEN pr.type = 'page' THEN p.name
          ELSE t.name
        END AS "name"`,
        `CASE
          WHEN pr.type = 'page' THEN p.status
          ELSE t.status
        END AS "status"`,
        `CASE
          WHEN pr.type = 'page' AND p.micrositie_id IS NOT NULL
            THEN CONCAT(ms.path, '/', p.path)
          WHEN pr.type = 'page'
            THEN CONCAT('/', p.path)
          ELSE NULL
        END AS "path"`,
        `pr.page_id AS "pageId"`,
        `pr.template_id AS "templateId"`,
        `pr.id AS "id"`,
        `pr.comment AS "comment"`,
        `pr.type AS "type"`,
        `pr.status_review AS "statusReview"`,
        `CONCAT(uc.firstname, ' ', uc.lastname) AS "userChanges"`,
        `CONCAT(ur.firstname, ' ', ur.lastname) AS "userReview"`,
      ])
      .from(PageReview, 'pr')
      .leftJoin(Page, 'p', 'pr.page_id = p.id and p.status = :status', {
        status: true,
      })
      .leftJoin(Template, 't', 'pr.template_id = t.id and t.status = :status', {
        status: true,
      })
      .innerJoin(User, 'uc', 'uc.id = pr.user_changes_id')
      .innerJoin(
        PermissionSitie,
        'ps',
        `(
          (
            pr.type = 'page'
            AND (
              (p.sitie_id IS NOT NULL AND ps.sitie_id = p.sitie_id)
              OR
              (p.micrositie_id IS NOT NULL AND ps.micrositie_id = p.micrositie_id)
            )
          )
          OR
          (
            pr.type = 'template'
            AND ps.sitie_id = (
              SELECT s.id
              FROM public.sitie s
              ORDER BY s.id DESC
              LIMIT 1
            )
          )
        )
        AND ps.user_id = :userId
        AND ps.status = :status`,
        {
          userId,
          status: true,
        },
      )
      .leftJoin(User, 'ur', 'ur.id = pr.user_review_id')
      .leftJoin(Micrositie, 'ms', 'ms.id = p.micrositie_id');

    if (
      paginationRequest.search !== null &&
      paginationRequest.search !== undefined
    ) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where(`upper(p.name) like :search`, {
            search: `%${paginationRequest.search!.toUpperCase()}%`,
          });
          qb.orWhere(`upper(p.path) like :search`, {
            search: `%${paginationRequest.search!.toUpperCase()}%`,
          });
          qb.orWhere(`upper(t.name) like :search`, {
            search: `%${paginationRequest.search!.toUpperCase()}%`,
          });
        }),
      );
    }

    if (paginationRequest.statusReview) {
      query.andWhere('pr.status_review = :statusReview', {
        statusReview: paginationRequest.statusReview,
      });
    }

    query.andWhere(
      '(pr.user_review_id IS NULL OR pr.user_review_id = :userId)',
      { userId },
    );

    const total = await query.getCount();
    const records = await query
      .groupBy('p.id')
      .addGroupBy('pr.id')
      .addGroupBy('t.name')
      .addGroupBy('t.status')
      .addGroupBy('ms.name')
      .addGroupBy('uc.firstname')
      .addGroupBy('uc.lastname')
      .addGroupBy('ur.firstname')
      .addGroupBy('ur.lastname')
      .addGroupBy('ms.path')
      .orderBy('pr.id', 'DESC')
      .offset((paginationRequest.page - 1) * paginationRequest.limit)
      .limit(paginationRequest.limit)
      .getRawMany<ReviewPageDataI>();
    const totalPage = Math.ceil(total / paginationRequest.limit);

    return {
      records,
      total,
      page: Number(paginationRequest.page),
      totalPage,
    };
  }

  async findForReview(
    reviewId: number,
    dataSource: EntityManager | null | DataSource,
  ): Promise<ReviewPageDataI | undefined> {
    if (dataSource === null) dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'pr.id as "id"',
        'pr.mongo_id as "mongoId"',
        'pr.page_id as "pageId"',
        `pr.template_id AS "templateId"`,
        'pr.comment as "comment"',
        'pr.comments as "comments"',
        'pr.type as "type"',
        'pr.status_review as "statusReview"',
        `CONCAT(uc.firstname, ' ', uc.lastname) as "userChanges"`,
        `CONCAT(ur.firstname, ' ', ur.lastname) as "userReview"`,
      ])
      .from(PageReview, 'pr')
      .where(`pr.id = :reviewId`, { reviewId })
      .innerJoin(User, 'uc', 'uc.id = pr.user_changes_id')
      .leftJoin(User, 'ur', 'ur.id = pr.user_review_id');

    return query.getRawOne<ReviewPageDataI>();
  }
}
