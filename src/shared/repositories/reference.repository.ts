import {
  Reference,
  ReferenceReview,
} from 'lib-database/src/entities/public-api';
import { Database } from 'lib-database/src/shared/config/database';
import {
  ReferenceI,
  ReferenceReviewI,
} from '../interfaces/reference.interface';
import { errorQuery } from '../helpers/database.helper';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ColumnsEnum } from '../enums/columns.enum';
import { EntityManager } from 'typeorm';

export class ReferenceRepository {
  async create(
    reference: ReferenceI,
    dataSource: EntityManager,
  ): Promise<ReferenceI> {
    try {
      const referenceRepository = dataSource.getRepository(Reference);
      const newReference = referenceRepository.create(reference as Reference);
      return await referenceRepository.save(newReference);
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    reference: ReferenceI,
    dataSource: EntityManager,
  ): Promise<number> {
    try {
      const update = await dataSource
        .createQueryBuilder()
        .update(Reference)
        .set({ text: reference.text })
        .where('ref = :ref', { ref: reference.ref })
        .andWhere('language_id = :languageId', {
          languageId: reference.languageId,
        })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async find(ref: string, languageId: number): Promise<ReferenceI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'r.ref as ref',
        'r.language_id as "languageId"',
        'r.text as "text"',
      ])
      .from(Reference, 'r')
      .where('r.ref = :ref', { ref })
      .andWhere('r.language_id = :languageId', { languageId });
    return await query.getRawOne<ReferenceI>();
  }

  async get(ref: string): Promise<ReferenceI[]> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'r.ref as ref',
        'r.language_id as "languageId"',
        'r.text as "text"',
      ])
      .from(Reference, 'r')
      .where('r.ref = :ref', { ref });
    return await query.getRawMany<ReferenceI>();
  }

  async getAll(dataSource: EntityManager): Promise<ReferenceI[]> {
    const query = dataSource
      .createQueryBuilder()
      .select(['r.ref as ref', 'r.text as "text"'])
      .from(Reference, 'r')
      .distinctOn(['r.ref'])
      .orderBy('r.ref', 'ASC')
      .where('r.status = :status', { status: true });
    return await query.getRawMany<ReferenceI>();
  }

  async createRefReview(
    reference: ReferenceReviewI,
    dataSource: EntityManager,
  ): Promise<ReferenceReviewI> {
    try {
      const referenceReviewRepository =
        dataSource.getRepository(ReferenceReview);
      const newReferenceReview = referenceReviewRepository.create(
        reference as ReferenceReview,
      );
      return await referenceReviewRepository.save(newReferenceReview);
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async updateRefReview(
    reference: ReferenceReviewI,
    dataSource: EntityManager,
  ): Promise<number> {
    try {
      const update = await dataSource
        .createQueryBuilder()
        .update(ReferenceReview)
        .set({ text: reference.text })
        .where('ref = :ref', { ref: reference.ref })
        .andWhere('language_id = :languageId', {
          languageId: reference.languageId,
        })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async findRefReview(
    ref: string,
    languageId: number,
    pageId: number,
  ): Promise<ReferenceReviewI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'rr.ref as ref',
        'rr.language_id as "languageId"',
        'rr.text as "text"',
      ])
      .from(ReferenceReview, 'rr')
      .where('rr.ref = :ref', { ref })
      .andWhere('rr.language_id = :languageId', { languageId })
      .andWhere('rr.page_id = :pageId', { pageId });
    return await query.getRawOne<ReferenceReviewI>();
  }

  async getRefReviewByPageId(pageId: number): Promise<ReferenceReviewI[]> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'rr.ref as ref',
        'rr.language_id as "languageId"',
        'rr.text as "text"',
      ])
      .from(ReferenceReview, 'rr')
      .where('rr.page_id = :pageId', { pageId });
    return await query.getRawMany<ReferenceReviewI>();
  }

  async getRefReview(ref: string): Promise<ReferenceReviewI[]> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'rr.ref as ref',
        'rr.language_id as "languageId"',
        'rr.text as "text"',
      ])
      .from(ReferenceReview, 'rr')
      .where('rr.ref = :ref', { ref });
    return await query.getRawMany<ReferenceReviewI>();
  }
}
