import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export interface PaginationResponseI<T> {
  records: T;
  total: number;
  page: number;
  totalPage: number;
}

export class PaginationResquestDto {
  @Type(() => Number)
  @IsInt({ message: 'El valor página debe ser un número entero' })
  @IsPositive({ message: 'Página debe ser mayor a 0' })
  page: number;

  @Type(() => Number)
  @IsInt({ message: 'El valor de límite debe ser un número entero' })
  @IsPositive({ message: 'Límite debe ser mayor a 0' })
  limit: number;

  @IsString({ message: 'Valor de busqueda no válido' })
  @IsOptional()
  search: string | null;

  @Type(() => Boolean)
  @IsBoolean({ message: 'Estado no válido' })
  @IsOptional()
  status: boolean | null;
}
