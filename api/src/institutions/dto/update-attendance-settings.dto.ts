import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationFrequency } from '../../../prisma/generated/client';

export class UpdateAttendanceSettingsDto {
  @ApiPropertyOptional({
    description: 'Habilitar toma de asistencia con App Móvil QR',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enableQrAttendance?: boolean;

  @ApiPropertyOptional({
    description: 'Habilitar toma de asistencia con Reloj Biométrico',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  enableBiometricAttendance?: boolean;

  @ApiPropertyOptional({
    description: 'Minutos de tolerancia para Atraso',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(180, {
    message: 'La tolerancia de atraso no puede superar los 180 minutos',
  })
  lateToleranceMinutes?: number;

  @ApiPropertyOptional({
    description: 'Minutos de tolerancia para Falta Injustificada',
    example: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(180, {
    message: 'La tolerancia de falta no puede superar los 180 minutos',
  })
  absentToleranceMinutes?: number;

  @ApiPropertyOptional({
    enum: NotificationFrequency,
    description: 'Frecuencia de alertas a padres',
    example: 'ALERTS_ONLY',
  })
  @IsOptional()
  @IsEnum(NotificationFrequency, {
    message: 'Frecuencia de notificación inválida',
  })
  notificationFrequency?: NotificationFrequency;
}
