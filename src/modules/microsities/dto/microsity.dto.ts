import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PermissionSitieI } from '@shared/interfaces/permission-sitie.interface.js';

export class CreateMicrosityDto {
  @IsString({ message: 'Nombre debe ser texto' })
  @IsNotEmpty({ message: 'Nombre es requerido' })
  name: string;

  @IsString({ message: 'Descripción debe ser texto' })
  @IsNotEmpty({ message: 'Descripción es requerido' })
  @MaxLength(255, {
    message: 'Descripción solo permite un máximo de 255 caracteres',
  })
  description: string;

  @IsString({ message: 'Camino del micrositio debe ser texto' })
  @IsOptional()
  path: string;

  @IsInt({ message: 'Sitio no válido' })
  @IsNotEmpty({ message: 'Sitio es requerido' })
  sitieId: number;

  @IsInt({ message: 'Plantilla no válida' })
  @IsNotEmpty({ message: 'Plantilla es requerido' })
  templateId: number;
}

export class UpdateMicrosityDto {
  @IsString({ message: 'Nombre debe ser texto' })
  @IsNotEmpty({ message: 'Nombre es requerido' })
  name: string;

  @IsString({ message: 'Descripción debe ser texto' })
  @IsNotEmpty({ message: 'Descripción es requerido' })
  @MaxLength(255, {
    message: 'Descripción solo permite un máximo de 255 caracteres',
  })
  description: string;

  @IsBoolean({ message: 'Estado no válido' })
  @IsOptional()
  status: boolean;

  @IsInt({ message: 'Plantilla no válida' })
  @IsNotEmpty({ message: 'Plantilla es requerido' })
  templateId: number;
}

export class AssignUserMicrositieDto {
  @IsArray({ message: 'Usuarios debe ser un array de números' })
  @ArrayNotEmpty({ message: 'Usuarios es requerido' })
  @ArrayMinSize(1, { message: 'Debe indicar al menos un usuario' })
  @IsInt({ each: true, message: 'Cada usuario debe ser un número entero' })
  users: number[];
}

export interface MicrositieI {
  id?: number;
  name: string;
  description: string;
  path: string;
  sitieId: number;
  templateId: number;
  status?: boolean;
  pathPage?: string;
  permissionMicrositie?: PermissionSitieI[];
}
