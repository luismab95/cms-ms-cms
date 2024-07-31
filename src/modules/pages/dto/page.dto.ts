import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ModeEnum } from 'lib-database/src/entities/cms/page.entity';
import { SectionI } from 'src/shared/interfaces/page.interface';
import { PaginationResquestDto } from 'src/shared/interfaces/pagination.interface';
import { ReferenceI } from 'src/shared/interfaces/reference.interface';

export class CreatePageDto {
  @IsString({ message: 'Nombre debe ser texto' })
  @IsNotEmpty({ message: 'Nombre es requerido' })
  name: string;

  @IsString({ message: 'Camino debe ser texto' })
  @IsNotEmpty({ message: 'Camino es requerido' })
  path: string;

  @IsInt({ message: 'Micrositio no válido' })
  @IsOptional()
  micrositieId: number;

  @IsObject({ message: 'Contenido debe ser un objeto' })
  data?: PageMongoI;

  @IsOptional()
  mongoId?: string;

  @IsInt({ message: 'Sitio no válido' })
  @IsOptional()
  sitieId?: number;

  @IsBoolean({ message: 'Estado no válido' })
  @IsOptional()
  isHomePage: boolean;
}

export class ReferenceUpdatePageDto {
  @IsString({ message: 'Referencia debe ser texto' })
  @IsNotEmpty({ message: 'Referencia es requerido' })
  ref: string;

  @IsString({ message: 'Texto debe ser texto' })
  @IsNotEmpty({ message: 'Texto es requerido' })
  @MaxLength(255, { message: 'Texto no puede exceder 255 caracteres' })
  value: string;
}

export class DetailsUpdatePageDto {
  @Type(() => ReferenceUpdatePageDto)
  @IsArray({ message: 'Referencias debe ser un array' })
  references?: ReferenceUpdatePageDto[];

  @IsInt({ message: 'Idioma no válido' })
  @IsNotEmpty({ message: 'Idioma es requerido' })
  lang: number;
}

export class UpdatePageDto {
  @IsString({ message: 'Nombre debe ser texto' })
  @IsNotEmpty({ message: 'Nombre es requerido' })
  name: string;

  @IsObject({ message: 'Contenido debe ser un objeto' })
  @IsOptional()
  data?: PageMongoI;

  @Type(() => DetailsUpdatePageDto)
  @IsArray({ message: 'Detalle debe ser un array' })
  @IsOptional()
  detail?: DetailsUpdatePageDto[];

  @IsBoolean({ message: 'Estado no válido' })
  @IsOptional()
  status: boolean;

  @IsBoolean({ message: 'Estado no válido' })
  @IsOptional()
  isHomePage: boolean;
}

export class GetallDto extends PaginationResquestDto {
  @IsInt({ message: 'Micrositio no válido' })
  @IsOptional()
  micrositieId?: number | null;
}

export interface PageDetailReferenceI {
  languageId: number;
  alias: ReferenceI;
  description: ReferenceI;
  keywords: ReferenceI;
}

export interface PageI {
  id: number;
  name: string;
  path: string;
  mongoId: string;
  isHomePage: boolean;
  sitieId: number;
  micrositieId: number | null;
  mode: ModeEnum;
  status: boolean;
  data?: PageDataMongoI;
  draft?: PageDataMongoI;
  details?: PageDetailReferenceI[];
  aliasRef?: string;
  descriptionRef?: string;
  seoKeywordsRef?: string;
}

export interface PageDetailI {
  id?: number;
  aliasRef: string;
  descriptionRef: string;
  seoKeywordsRef: string;
  pageId: number;
}

export interface PageBodyI {
  css: string;
  data: SectionI[];
  config: { [key: string]: any };
}

export interface PageDataMongoI {
  body: PageBodyI;
}

export interface PageMongoI extends Document {
  data: PageDataMongoI;
}
