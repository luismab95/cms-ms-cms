import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLanguageDto {
  @IsString({ message: 'Código debe ser texto' })
  @IsNotEmpty({ message: 'Código es requerido' })
  lang: string;

  @IsString({ message: 'Idioma debe ser texto' })
  @IsNotEmpty({ message: 'Idioma es requerido' })
  name: string;

  @IsString({ message: 'Icono del idioma debe ser texto' })
  @IsNotEmpty({ message: 'Icono del idioma es requerido' })
  icon: string;

  @IsInt({ message: 'Sitio no válido' })
  @IsNotEmpty({ message: 'Sitio es requerido' })
  sitieId: number;
}

export class UpdateLanguageDto {
  @IsString({ message: 'Código debe ser texto' })
  @IsNotEmpty({ message: 'Código es requerido' })
  lang: string;

  @IsString({ message: 'Idioma debe ser texto' })
  @IsNotEmpty({ message: 'Idioma es requerido' })
  name: string;

  @IsString({ message: 'Icono del idioma debe ser texto' })
  @IsNotEmpty({ message: 'Icono del idioma es requerido' })
  icon: string;

  @IsInt({ message: 'Sitio no válido' })
  @IsNotEmpty({ message: 'Sitio es requerido' })
  sitieId: number;

  @IsBoolean({ message: 'Estado no válido' })
  @IsOptional()
  status: number;
}

export interface LanguageI {
  id?: number;
  lang: string;
  name: string;
  icon: string;
  sitieId: number;
  status?: boolean;
}
