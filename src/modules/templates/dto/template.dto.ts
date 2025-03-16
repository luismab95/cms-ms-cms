import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Document } from 'mongoose';
import { SectionI } from 'src/shared/interfaces/page.interface';

export class CreateTemplateDto {
  @IsString({ message: 'Nombre debe ser texto' })
  @IsNotEmpty({ message: 'Nombre es requerido' })
  name: string;

  @IsString({ message: 'Descripción debe ser texto' })
  @IsNotEmpty({ message: 'Descripción es requerido' })
  @MaxLength(255, {
    message: 'Descripción solo permite un máximo de 255 caracteres',
  })
  description: string;

  @IsObject({ message: 'Contenido debe ser un objeto' })
  data?: TemplateMongoI;

  @IsOptional()
  mongoId?: string;
}

export class UpdateTemplateDto {
  @IsString({ message: 'Nombre debe ser texto' })
  @IsNotEmpty({ message: 'Nombre es requerido' })
  name: string;

  @IsString({ message: 'Descripción debe ser texto' })
  @IsNotEmpty({ message: 'Descripción es requerido' })
  @MaxLength(255, {
    message: 'Descripción solo permite un máximo de 255 caracteres',
  })
  description: string;

  @IsObject({ message: 'Contenido debe ser un objeto' })
  @IsOptional()
  data?: TemplateMongoI;

  @IsOptional()
  @IsBoolean({ message: 'Estado no válido' })
  status: boolean;
}

export interface TemplateI {
  id: number;
  name: string;
  description: string;
  mongoId: string;
  status: boolean;
  data?: TemplateDataMongoI;
  draft?: TemplateDataMongoI | null;
}

export interface TemplateNestedObjectI {
  css: string;
  data: SectionI[];
  config: { [key: string]: any };
}

export interface TemplateDataMongoI {
  header: TemplateNestedObjectI;
  footer: TemplateNestedObjectI;
}

export interface TemplateMongoI extends Document {
  data: TemplateDataMongoI;
}
