import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { AttendanceStatus } from '../../../prisma/generated/client';

export class ManualAttendanceDto {
  @ApiProperty({
    description: 'UUID de la inscripción del estudiante',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El enrollmentId debe ser un UUID válido.' })
  @IsNotEmpty()
  enrollmentId: string;

  @ApiPropertyOptional({
    description: 'Periodo individual de clase',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El classPeriodId debe ser un UUID válido.' })
  classPeriodId?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Bloque múltiple de periodos de clase',
    example: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', {
    each: true,
    message:
      'Cada ID de periodo de clase debe ser un UUID de versión 4 válido.',
  })
  classPeriodIds?: string[];

  @ApiProperty({
    enum: AttendanceStatus,
    description: 'Estado de la asistencia',
    example: 'PRESENT',
  })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;
}
