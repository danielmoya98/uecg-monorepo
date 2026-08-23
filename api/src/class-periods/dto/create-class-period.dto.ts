import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Matches,
  IsNotEmpty,
  Min,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Shift } from '../../../prisma/generated/client';

const normalizeTime = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  const trimmed = val.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    const hours = match[1].padStart(2, '0');
    const minutes = match[2];
    return `${hours}:${minutes}`;
  }
  return trimmed;
};

export class CreateClassPeriodDto {
  @ApiProperty({
    example: '1ra Hora',
    description: 'Nombre del periodo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    example: '08:00',
    description: 'Hora inicio HH:MM (24 horas)',
  })
  @IsString()
  @Transform(({ value }) => normalizeTime(value))
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime debe tener formato HH:MM (ej. 08:00)',
  })
  startTime: string;

  @ApiProperty({
    example: '08:40',
    description: 'Hora fin HH:MM (24 horas)',
  })
  @IsString()
  @Transform(({ value }) => normalizeTime(value))
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime debe tener formato HH:MM (ej. 08:40)',
  })
  endTime: string;

  @ApiProperty({
    enum: Shift,
    example: Shift.MANANA,
  })
  @IsEnum(Shift)
  shift: Shift;

  @ApiProperty({
    example: false,
    description: 'Indica si es recreo o descanso',
  })
  @IsBoolean()
  isBreak: boolean;

  @ApiProperty({
    example: 1,
    description: 'Orden cronológico dentro del turno',
  })
  @IsInt()
  @Min(1)
  order: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado activo del periodo de clase',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

