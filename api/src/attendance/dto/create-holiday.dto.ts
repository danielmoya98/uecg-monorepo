import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateHolidayDto {
  @ApiProperty({
    description: 'Nombre o motivo del feriado / día no lectivo',
    example: 'Día del Trabajo',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del feriado no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  name: string;

  @ApiProperty({
    description: 'Fecha del feriado (YYYY-MM-DD)',
    example: '2026-05-01',
  })
  @IsDateString(
    {},
    { message: 'La fecha debe ser un formato de fecha válido (YYYY-MM-DD).' },
  )
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    description: 'UUID del año académico (opcional, si aplica sólo a una gestión)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El academicYearId debe ser un UUID válido.' })
  academicYearId?: string;

  @ApiPropertyOptional({
    description: 'Indica si se repite todos los años',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}
