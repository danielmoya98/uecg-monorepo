import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EducationLevel } from '../../../prisma/generated/client';

export class CreateSubjectDto {
  @ApiProperty({
    example: 'Matemáticas',
    description: 'Nombre oficial de la materia',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la materia es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name: string;

  @ApiPropertyOptional({
    example: 'MAT',
    description: 'Sigla o código corto oficial de la materia',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @MaxLength(15, { message: 'El código no puede exceder los 15 caracteres' })
  @IsOptional()
  code?: string;

  @ApiProperty({
    enum: EducationLevel,
    description: 'Nivel en el que se dicta (INICIAL, PRIMARIA, SECUNDARIA)',
  })
  @IsEnum(EducationLevel, { message: 'Nivel educativo inválido' })
  level: EducationLevel;

  @ApiPropertyOptional({
    example: 'Ciencia, Tecnología y Producción',
    description: 'Área o Campo de Saberes al que pertenece la materia',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El área debe ser una cadena de texto' })
  @MaxLength(120, { message: 'El área no puede exceder los 120 caracteres' })
  @IsOptional()
  area?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si la materia está activa en el catálogo institucional',
    default: true,
  })
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  @IsOptional()
  isActive?: boolean;
}
