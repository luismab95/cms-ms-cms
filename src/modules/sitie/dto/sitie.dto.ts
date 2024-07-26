import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateSitieDto {
  @IsString({ message: 'Nombre debe ser texto' })
  @IsNotEmpty({ message: 'Nombre es requerido' })
  name: string;

  @IsString({ message: 'Descripción debe ser texto' })
  @IsNotEmpty({ message: 'Descripción es requerido' })
  @MaxLength(255, {
    message: 'Descripción solo permite un máximo de 255 caracteres',
  })
  description: string;

  @IsString({ message: 'Dominio debe ser texto' })
  @IsNotEmpty({ message: 'Dominio es requerido' })
  domain: string;

  @IsInt({ message: 'Plantilla debe ser número' })
  @IsNotEmpty({ message: 'Plantilla es requerido' })
  templateId: number;

  @IsBoolean({ message: 'Estado no válido' })
  @IsOptional()
  status: boolean;

  @IsBoolean({ message: 'Mantenimiento no válido' })
  @IsOptional()
  maintenance: boolean;
}

export interface SitieI {
  id?: number;
  name: string;
  description: string;
  domain: string;
  templateId: number;
  status: boolean;
  maintenance: boolean;
}
