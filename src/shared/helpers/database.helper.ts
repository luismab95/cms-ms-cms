import { DATABASE_ERR } from '../constants/message.constants';
import { Brackets, SelectQueryBuilder } from 'typeorm';

export function errorQuery(error: any, valueEnum: any) {
  let customMessage = DATABASE_ERR;
  if (error.detail && error.detail.includes('already exists')) {
    const valueMatch = error.detail.match(/Key \((.*?)\)=\((.*?)\)/);
    const field = valueMatch ? valueMatch[1] : 'unknown field';
    const value = valueMatch ? valueMatch[2] : 'unknown value';
    const columnValue = valueEnum[field as keyof typeof valueEnum];
    customMessage = `El valor ${value} para el campo ${columnValue} ya fue registrado.`;
  }
  return customMessage;
}

export const queryFilter = (
  query: SelectQueryBuilder<any>,
  alias: string,
  filters: string[],
  status?: boolean,
  search?: string | null,
) => {
  if (status !== null && status !== undefined) {
    query.where(`${alias}.status = :status`, { status });
  }

  if (search !== null && search !== undefined) {
    query.andWhere(
      new Brackets((qb) => {
        qb.where(`upper(${alias}.${filters[0]}) like :search`, {
          search: `%${search.toUpperCase()}%`,
        });
        filters.forEach((filter, index) => {
          if (index !== 0)
            qb.orWhere(`upper(${alias}.${filter}) like :search`, {
              search: `%${search.toUpperCase()}%`,
            });
        });
      }),
    );
  }

  return query;
};
