import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SpaceType } from '../../../prisma/generated/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePhysicalSpaceDto {
  @ApiProperty({
    description: 'Nombre del espacio físico',
    example: 'Aula 101',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'El nombre del espacio es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name: string;

  @ApiProperty({ description: 'Tipo de espacio', enum: SpaceType })
  @IsEnum(SpaceType, { message: 'El tipo de espacio no es válido' })
  @IsNotEmpty()
  type: SpaceType;

  @ApiProperty({
    description: 'Capacidad máxima de alumnos/aforo del espacio',
    example: 35,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La capacidad debe ser un número entero' })
  @Min(1, { message: 'La capacidad debe ser de al menos 1 persona' })
  @Max(500, { message: 'La capacidad no puede exceder las 500 personas' })
  capacity?: number;

  @ApiProperty({
    description: 'Pabellón o bloque donde se ubica el espacio',
    example: 'Bloque Primaria',
    required: false,
  })
  @IsString()
  @IsOptional()
  building?: string;

  @ApiProperty({
    description: 'Piso o nivel del espacio',
    example: 'Piso 1',
    required: false,
  })
  @IsString()
  @IsOptional()
  floor?: string;

  @ApiProperty({
    description: 'Descripción o equipamiento disponible',
    example: 'Cuenta con proyector y pizarra interactiva',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Si el espacio está habilitado para su uso' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
