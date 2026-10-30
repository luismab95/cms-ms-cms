import { Database, Element as ElementCMS } from 'cms-lib-database';
import {
  PaginationResquestDto,
  PaginationResponseI,
  queryFilter,
} from 'cms-lib-resources';
import { ElementCMSI } from '../dto/element.dto.js';

export class ElementRepository {
  async get(
    paginationRequest: PaginationResquestDto,
  ): Promise<PaginationResponseI<ElementCMSI[]>> {
    const dataSource = Database.getConnection();
    let query = dataSource
      .createQueryBuilder()
      .select([
        'e.id as "id"',
        'e.code as code',
        'e.name as name',
        'e.description as description',
        'e.icon as "icon"',
        'e.css as css',
        'e.style as style',
        'e.config as config',
        'e.type as "type"',
        'e.text as "text"',
        'e.kind as "kind"',
        'e.children_schema as "childrenSchema"',
        'e.status as status',
      ])
      .from(ElementCMS, 'e');

    query = queryFilter(
      query,
      'e',
      ['name', 'description'],
      paginationRequest.status!,
      paginationRequest.search,
    );

    const total = await query.getCount();
    let records = await query
      .groupBy('e.id')
      .orderBy('e.id', 'DESC')
      .offset((paginationRequest.page - 1) * paginationRequest.limit)
      .limit(paginationRequest.limit)
      .getRawMany<ElementCMSI>();
    const totalPage = Math.ceil(total / paginationRequest.limit);

    records = records.map((element) => this.buildChildren(element, records));

    return {
      records,
      total,
      page: Number(paginationRequest.page),
      totalPage,
    };
  }

  private buildChildren(
    element: ElementCMSI,
    records: ElementCMSI[],
  ): ElementCMSI {
    const childrens: ElementCMSI[] = [];

    if (element.kind === 'composite' && element.childrenSchema?.length) {
      element.childrenSchema.forEach((child) => {
        const findChild = records.find((item) => item.id === child.elementId);
        if (!findChild) return;
        childrens.push(
          this.buildChildren(
            {
              ...findChild,
              style: child.style,
              slot: child.slot,
              childrenSchema: child.childrens ?? [],
            },
            records,
          ),
        );
      });
    }

    return {
      ...element,
      childrens,
    };
  }
}
