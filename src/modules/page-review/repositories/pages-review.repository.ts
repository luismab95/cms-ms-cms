import { HttpException, HttpStatus } from '@nestjs/common';
import {
  EntityManager,
  Page,
  Database,
  PermissionSitie,
  PageReview,
  Micrositie,
  User,
} from 'cms-lib-database';
import {
  errorQuery,
  ColumnsEnum,
  PaginationResponseI,
  queryFilter,
} from 'cms-lib-resources';
import {
  ReviewPageDto,
  ReviewPageDataI,
  GetallDto,
} from '../dto/page-review.dto.js';

export class PageReviewRepository {
  async findPageReview(pageId: number): Promise<ReviewPageDataI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'pr.id as "id"',
        'pr.mongo_id as "mongoId"',
        'pr.page_id as "pageId"',
        'pr.comment as "comment"',
        'pr.status_review as "statusReview"',
        `CONCAT(uc.firstname, ' ', uc.lastname) as "userChanges"`,
        `CONCAT(ur.firstname, ' ', ur.lastname) as "userReview"`,
      ])
      .from(PageReview, 'pr')
      .innerJoin(User, 'uc', 'uc.id = pr.user_changes_id')
      .leftJoin(User, 'ur', 'ur.id = pr.user_review_id')
      .where(`pr.pageId = :pageId`, { pageId })
      .orderBy('pr.id', 'DESC');

    return query.getRawOne<ReviewPageDataI>();
  }

  async createReviewPage(
    reviewPage: ReviewPageDataI,
    dataSource: EntityManager,
  ): Promise<ReviewPageDataI> {
    try {
      const pageReviewRepository = dataSource.getRepository(PageReview);
      const { pageId, statusReview, userChangesId, mongoId } = reviewPage;
      const newPageReview = {
        mongoId,
        comment: '',
        statusReview,
        pageId,
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
  ): Promise<number> {
    try {
      const dataSource = Database.getConnection();
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
        'p.name as name',
        'p.path as path',
        'p.status as status',
        'pr.page_id as "pageId"',
        'pr.id as "id"',
        'pr.comment as "comment"',
        'pr.status_review as "statusReview"',
        `CONCAT(uc.firstname, ' ', uc.lastname) as "userChanges"`,
        `CONCAT(ur.firstname, ' ', ur.lastname) as "userReview"`,
      ])
      .from(Page, 'p')
      .innerJoin(PageReview, 'pr', 'pr.page_id = p.id')
      .innerJoin(User, 'uc', 'uc.id = pr.user_changes_id')
      .innerJoin(
        PermissionSitie,
        'ps',
        `(
            (p.sitie_id IS NOT NULL AND ps.sitie_id = p.sitie_id)
            OR
            (p.micrositie_id IS NOT NULL AND ps.micrositie_id = p.micrositie_id)
          )
          AND ps.user_id = :userId
          AND ps.status = :status`,
        { userId, status: true },
      )
      .leftJoin(User, 'ur', 'ur.id = pr.user_review_id')
      .leftJoin(Micrositie, 'ms', 'ms.id = p.micrositie_id');

    query = queryFilter(
      query,
      'p',
      ['name', 'path'],
      paginationRequest.status!,
      paginationRequest.search,
    );

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
      .addGroupBy('ms.name')
      .addGroupBy('uc.firstname')
      .addGroupBy('uc.lastname')
      .addGroupBy('ur.firstname')
      .addGroupBy('ur.lastname')
      .orderBy('p.id', 'DESC')
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

  async findForReview(id: number): Promise<ReviewPageDataI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'pr.id as "id"',
        'pr.mongo_id as "mongoId"',
        'pr.page_id as "pageId"',
        'pr.comment as "comment"',
        'pr.status_review as "statusReview"',
      ])
      .from(PageReview, 'pr')
      .where(`pr.id = :id`, { id });

    return query.getRawOne<ReviewPageDataI>();
  }
}
