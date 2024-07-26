import { Database } from 'lib-database/src/shared/config/database';
import { SitieI, UpdateSitieDto } from '../dto/sitie.dto';
import { Sitie } from 'lib-database/src/entities/public-api';
import { HttpException, HttpStatus } from '@nestjs/common';
import { errorQuery } from 'src/shared/helpers/database.helper';
import { ColumnsEnum } from 'src/shared/enums/columns.enum';

export class SitieRepository {
  async update(sitieId: number, sitie: UpdateSitieDto): Promise<number> {
    try {
      const dataSource = Database.getConnection();
      const update = await dataSource
        .createQueryBuilder()
        .update(Sitie)
        .set(sitie)
        .where('id = :sitieId', { sitieId })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async find(): Promise<SitieI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        's.id as "id"',
        's.name as name',
        's.description as description',
        's.domain as "domain"',
        's.status as status',
        's.maintenance as maintenance',
        's.template_id as "templateId"',
      ])
      .from(Sitie, 's');
    return query.getRawOne<SitieI>();
  }
}
