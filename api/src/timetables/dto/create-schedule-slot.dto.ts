import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateScheduleSlotDto {
  @ApiProperty({
    description: 'Día de la semana (1 = Lunes, 6 = Sábado)',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: 'ID del periodo de clase (Ej. 1er Periodo)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID('4')
  @IsNotEmpty()
  classPeriodId: string;

  @ApiProperty({
    description: 'ID de la asignación (La materia y el profe)',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID('4')
  @IsNotEmpty()
  teacherAssignmentId: string;

  @ApiProperty({
    description: 'ID del curso/aula académica',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsUUID('4')
  @IsNotEmpty()
  classroomId: string;

  @ApiProperty({
    description: 'ID del docente asignado',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  @IsUUID('4')
  @IsNotEmpty()
  teacherId: string;

  @ApiPropertyOptional({
    description: 'ID del aula física donde se pasará la clase',
    example: '123e4567-e89b-12d3-a456-426614174005',
  })
  @IsUUID('4')
  @IsOptional()
  physicalSpaceId?: string;
}
