import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryTeacherAssignmentsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'UUID de la gestión académica',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El academicYearId debe ser un UUID válido.' })
  @IsOptional()
  academicYearId?: string;

  @ApiPropertyOptional({
    description: 'UUID del curso/aula académica',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID('4', { message: 'El classroomId debe ser un UUID válido.' })
  @IsOptional()
  classroomId?: string;

  @ApiPropertyOptional({
    description: 'UUID del docente asignado',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID('4', { message: 'El teacherId debe ser un UUID válido.' })
  @IsOptional()
  teacherId?: string;
}
