import { HttpException, HttpStatus } from '@nestjs/common';
import { Database, EntityManager, Notify } from 'cms-lib-database';
import { errorQuery, ColumnsEnum } from 'cms-lib-resources';
import { NotifyI } from '../dto/notify.dto.js';

export class NotifyRepository {
  async getAll(userId: number): Promise<NotifyI[]> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'n.id as id',
        'n.message as message',
        'n.read_status as "readStatus"',
        'n.metadata as "metadata"',
        'n.created_at as "createdAt"',
      ])
      .from(Notify, 'n')
      .where('n.read_status = :status', { status: false })
      .andWhere('n.user_id = :userId', { userId })
      .orderBy('n.id', 'DESC');

    return await query.getRawMany<NotifyI>();
  }

  async create(notify: NotifyI, dataSource: EntityManager): Promise<NotifyI> {
    try {
      const notifyRepository = dataSource.getRepository(Notify);
      const newNotify = notifyRepository.create(notify as Notify);
      return await notifyRepository.save(newNotify);
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async update(notify: NotifyI): Promise<number> {
    try {
      const dataSource = Database.getConnection();
      const update = await dataSource
        .createQueryBuilder()
        .update(Notify)
        .set(notify)
        .where('id = :id', { id: notify.id })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }
}
