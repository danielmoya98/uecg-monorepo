import { ApiProperty } from '@nestjs/swagger';

import {
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Matches,
  IsNotEmpty,
  Min,
  MaxLength,
} from 'class-validator';

import { Transform } from 'class-transformer';

import { Shift } from '../../../prisma/generated/client';

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

    description: 'Hora inicio HH:MM',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime debe tener formato HH:MM',
  })
  startTime: string;

  @ApiProperty({
    example: '08:40',

    description: 'Hora fin HH:MM',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime debe tener formato HH:MM',
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

    description: 'Indica si es recreo',
  })
  @IsBoolean()
  isBreak: boolean;

  @ApiProperty({
    example: 1,

    description: 'Orden cronológico',
  })
  @IsInt()
  @Min(1)
  order: number;
}
