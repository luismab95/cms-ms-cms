import { HttpException, HttpStatus } from '@nestjs/common';
import { Database, Notify } from 'cms-lib-database';
import { errorQuery, ColumnsEnum } from 'cms-lib-resources';
import { NotifyI } from '../dto/notify.dto.js';

export class NotifyRepository {
  async getAll(roleId: number): Promise<NotifyI[]> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'n.id as id',
        'n.message as message',
        'n.path as path',
        'n.role_id as "roleId"',
        'n.read_status as "readStatus"',
        'n.metadata as "metadata"',
      ])
      .from(Notify, 'n')
      .where('n.read_status = :status', { status: false })
      .andWhere('n.role_id = :roleId', { roleId });

    return await query.getRawMany<NotifyI>();
  }

  async create(notify: NotifyI): Promise<NotifyI> {
    try {
      const dataSource = Database.getConnection();
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
