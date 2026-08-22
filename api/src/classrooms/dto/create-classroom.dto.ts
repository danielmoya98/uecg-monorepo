import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EducationLevel, Shift } from '../../../prisma/generated/client';

export class CreateClassroomDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID de la gestión académica (AcademicYear)',
  })
  @IsUUID('4', { message: 'El academicYearId debe ser un UUID válido.' })
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({
    enum: EducationLevel,
    description: 'Nivel educativo (INICIAL, PRIMARIA, SECUNDARIA)',
  })
  @IsEnum(EducationLevel, {
    message: 'Nivel educativo inválido',
  })
  level: EducationLevel;

  @ApiProperty({
    enum: Shift,
    description: 'Turno de clases (MANANA, TARDE, NOCHE)',
  })
  @IsEnum(Shift, {
    message: 'Turno inválido',
  })
  shift: Shift;

  @ApiProperty({
    example: 'Primero',
    description: 'Grado del curso',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Transform(({ value }) => value?.trim())
  grade: string;

  @ApiProperty({
    example: 'A',
    description: 'Paralelo / Sección',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  section: string;

  @ApiPropertyOptional({
    example: 35,
    description: 'Capacidad máxima de estudiantes por aula',
  })
  @IsInt()
  @Min(10)
  @Max(50)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'UUID del docente asesor o tutor del curso',
    nullable: true,
  })
  @IsUUID('4', { message: 'El advisorId debe ser un UUID válido.' })
  @IsOptional()
  @ValidateIf((o) => o.advisorId !== null && o.advisorId !== '')
  advisorId?: string | null;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174002',
    description: 'UUID del aula física (salón principal)',
    nullable: true,
  })
  @IsUUID('4', { message: 'El baseRoomId debe ser un UUID válido.' })
  @IsOptional()
  @ValidateIf((o) => o.baseRoomId !== null && o.baseRoomId !== '')
  baseRoomId?: string | null;
}
