import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../../prisma/generated/client';

export class AttendanceRecordDto {
  @ApiProperty({ description: 'UUID de la inscripción del estudiante' })
  @IsUUID('4', { message: 'El enrollmentId debe ser un UUID válido.' })
  @IsNotEmpty()
  enrollmentId: string;

  @ApiProperty({
    enum: AttendanceStatus,
    description: 'Estado de la asistencia',
  })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;
}

export class BulkAttendanceDto {
  @ApiProperty({ description: 'UUID del aula/curso' })
  @IsUUID('4', { message: 'El classroomId debe ser un UUID válido.' })
  @IsNotEmpty()
  classroomId: string;

  @ApiPropertyOptional({
    description: 'UUID del periodo de clase individual',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El classPeriodId debe ser un UUID válido.' })
  classPeriodId?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Lista de UUIDs de periodos de clase para guardado en bloque',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', {
    each: true,
    message: 'Cada classPeriodId debe ser un UUID válido.',
  })
  classPeriodIds?: string[];

  @ApiProperty({
    description: 'Fecha de la asistencia (YYYY-MM-DD)',
    example: '2026-05-26',
  })
  @IsDateString(
    {},
    { message: 'La fecha debe ser un formato de fecha válido (YYYY-MM-DD).' },
  )
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    type: [AttendanceRecordDto],
    description: 'Lista de registros de asistencia por estudiante',
  })
  @ValidateNested({
    each: true,
  })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}
