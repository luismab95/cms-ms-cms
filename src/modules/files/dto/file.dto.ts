import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFileDto {
  @IsString({ message: 'Nombre debe ser texto' })
  @IsNotEmpty({ message: 'Nombre es requerido' })
  name: string;

  @IsString({ message: 'Descripción debe ser texto' })
  @IsNotEmpty({ message: 'Descripción es requerido' })
  @MaxLength(255, {
    message: 'Descripción solo permite un máximo de 255 caracteres',
  })
  description: string;

  @IsString({ message: 'Nombre del archivo debe ser texto' })
  @IsNotEmpty({ message: 'Nombre del archivo es requerido' })
  filename: string;

  @IsString({ message: 'Tipo de archivo debe ser texto' })
  @IsNotEmpty({ message: 'Tipo de archivo es requerido' })
  mimeType: string;

  @IsString({ message: 'Camino del archivo debe ser texto' })
  @IsNotEmpty({ message: 'Camino del archivo es requerido' })
  path: string;

  @IsInt({ message: 'Tamaño de archivo no válido' })
  @IsNotEmpty({ message: 'Tamaño de archivo es requerido' })
  size: number;
}

export class UpdateFileDto {
  @IsString({ message: 'Descripción debe ser texto' })
  @IsNotEmpty({ message: 'Descripción es requerido' })
  @MaxLength(255, {
    message: 'Descripción solo permite un máximo de 255 caracteres',
  })
  description: string;

  @IsOptional()
  status: boolean;
}

export interface FileI {
  id: number;
  name: string;
  description: string;
  mimeType: string;
  size: number;
  filename: string;
  status: boolean;
  path: string;
  url?: string;
}
