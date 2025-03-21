import { Reference } from 'lib-database/src/entities/public-api';
import { Database } from 'lib-database/src/shared/config/database';
import { ReferenceI } from '../interfaces/reference.interface';
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
      .andWhere('r.languageId = :languageId', { languageId });
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
}
