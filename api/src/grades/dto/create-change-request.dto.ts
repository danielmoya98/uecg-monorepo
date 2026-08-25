import {
  IsUUID,
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChangeRequestDto {
  @ApiProperty({
    description: 'UUID de la nota consolidada a modificar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El gradeId debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El gradeId es obligatorio.' })
  gradeId: string;

  @ApiProperty({
    description:
      'Justificación detallada del docente para el descongelamiento de nota',
    example: 'Error al transcribir el examen del hacer.',
  })
  @IsString({ message: 'El justificativo debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El justificativo no puede estar vacío.' })
  reason: string;

  @ApiPropertyOptional({
    description: 'Propuesta de nota para la dimensión del SER (0-10)',
    minimum: 0,
    maximum: 10,
    example: 9,
  })
  @IsOptional()
  @IsInt({ message: 'La nota debe ser un número entero.' })
  @Min(0)
  @Max(10, { message: 'La nota no puede exceder los 10 puntos.' })
  proposedSer?: number;

  @ApiPropertyOptional({
    description: 'Propuesta de nota para la dimensión del SABER (0-45)',
    minimum: 0,
    maximum: 45,
    example: 38,
  })
  @IsOptional()
  @IsInt({ message: 'La nota debe ser un número entero.' })
  @Min(0)
  @Max(45, { message: 'La nota no puede exceder los 45 puntos.' })
  proposedSaber?: number;

  @ApiPropertyOptional({
    description: 'Propuesta de nota para la dimensión del HACER (0-40)',
    minimum: 0,
    maximum: 40,
    example: 35,
  })
  @IsOptional()
  @IsInt({ message: 'La nota debe ser un número entero.' })
  @Min(0)
  @Max(40, { message: 'La nota no puede exceder los 40 puntos.' })
  proposedHacer?: number;

  @ApiPropertyOptional({
    description: 'Propuesta de nota para la dimensión de AUTOEVALUACIÓN (0-5)',
    minimum: 0,
    maximum: 5,
    example: 4,
  })
  @IsOptional()
  @IsInt({ message: 'La nota debe ser un número entero.' })
  @Min(0)
  @Max(5, { message: 'La nota no puede exceder los 5 puntos.' })
  proposedAuto?: number;

  @ApiPropertyOptional({
    description:
      'Propuesta de nota para el examen de Reforzamiento/Recuperación (0-100)',
    minimum: 0,
    maximum: 100,
    example: 60,
  })
  @IsOptional()
  @IsInt({ message: 'La nota de recuperación debe ser un número entero.' })
  @Min(0)
  @Max(100, {
    message: 'La nota de recuperación no puede exceder los 100 puntos.',
  })
  proposedRecovery?: number;
}
