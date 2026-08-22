import { IsNotEmpty, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UpsertGradeDto } from './upsert-grade.dto';

export class BulkUpdateGradesDto {
  @ApiProperty({
    description: 'UUID de la asignación de docente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El teacherAssignmentId debe ser un UUID válido.' })
  @IsNotEmpty()
  teacherAssignmentId: string;

  @ApiProperty({
    description: 'UUID del trimestre',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID('4', { message: 'El trimesterId debe ser un UUID válido.' })
  @IsNotEmpty()
  trimesterId: string;

  @ApiProperty({
    type: [UpsertGradeDto],
    description: 'Planilla de notas de alumnos',
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpsertGradeDto)
  grades: UpsertGradeDto[];
}
