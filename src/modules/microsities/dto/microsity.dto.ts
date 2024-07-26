import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

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
}

export interface MicrositieI {
  id?: number;
  name: string;
  description: string;
  path: string;
  sitieId: number;
  status?: boolean;
}
