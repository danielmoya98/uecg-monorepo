import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { AttendanceMethod } from '../../../prisma/generated/client';

export class RegisterAttendanceDto {
  @ApiProperty({
    description: 'Token QR del estudiante',
    example: 'qr-token-string-12345',
  })
  @IsString()
  @IsNotEmpty()
  qrToken: string;

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

  @ApiPropertyOptional({
    enum: AttendanceMethod,
    default: AttendanceMethod.QR,
    description: 'Método de registro de asistencia',
  })
  @IsEnum(AttendanceMethod)
  @IsOptional()
  method?: AttendanceMethod;
}
