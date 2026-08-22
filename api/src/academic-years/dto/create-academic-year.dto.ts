import { ApiProperty } from '@nestjs/swagger';

import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsEnum,
  Min,
  IsDate,
  IsOptional,
  MaxLength,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';

import { AcademicStatus } from '../../../prisma/generated/client';

export class CreateAcademicYearDto {
  @ApiProperty({
    example: 2026,

    description: 'Año de la gestión académica',
  })
  @IsInt()
  @Min(2020, {
    message: 'El año no puede ser menor a 2020',
  })
  year: number;

  @ApiProperty({
    example: 'Gestión Académica 2026',

    description: 'Nombre oficial de la gestión',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    example: '2026-02-01T00:00:00.000Z',

    description: 'Fecha inicio clases',
  })
  @Type(() => Date)
  @IsDate({
    message: 'Debe ser una fecha válida',
  })
  startDate: Date;

  @ApiProperty({
    example: '2026-11-30T00:00:00.000Z',

    description: 'Fecha finalización',
  })
  @Type(() => Date)
  @IsDate({
    message: 'Debe ser una fecha válida',
  })
  endDate: Date;

  @ApiProperty({
    enum: AcademicStatus,

    required: false,

    default: AcademicStatus.PLANNING,
  })
  @IsOptional()
  @IsEnum(AcademicStatus, {
    message: 'Estado académico inválido',
  })
  status?: AcademicStatus;
}
