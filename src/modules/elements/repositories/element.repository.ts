import {
  PaginationResponseI,
  PaginationResquestDto,
} from 'src/shared/interfaces/pagination.interface';
import { ElementCMSI } from '../dto/element.dto';
import { Database } from 'lib-database/src/shared/config/database';
import { Element as ElementCMS } from 'lib-database/src/entities/public-api';
import { queryFilter } from 'src/shared/helpers/database.helper';

export class ElementRepository {
  async get(
    paginationRequest: PaginationResquestDto,
  ): Promise<PaginationResponseI<ElementCMSI[]>> {
    const dataSource = Database.getConnection();
    let query = dataSource
      .createQueryBuilder()
      .select([
        'e.id as "id"',
        'e.name as name',
        'e.description as description',
        'e.icon as "icon"',
        'e.css as css',
        'e.config as config',
        'e.type as "type"',
        'e.text as "text"',
        'e.status as status',
      ])
      .from(ElementCMS, 'e');

    query = queryFilter(
      query,
      'e',
      ['name', 'description'],
      paginationRequest.status,
      paginationRequest.search,
    );

    const total = await query.getCount();
    const records = await query
      .groupBy('e.id')
      .orderBy('e.id', 'DESC')
      .offset((paginationRequest.page - 1) * paginationRequest.limit)
      .limit(paginationRequest.limit)
      .getRawMany<ElementCMSI>();
    const totalPage = Math.ceil(total / paginationRequest.limit);

    return {
      records,
      total,
      page: Number(paginationRequest.page),
      totalPage,
    };
  }
}
