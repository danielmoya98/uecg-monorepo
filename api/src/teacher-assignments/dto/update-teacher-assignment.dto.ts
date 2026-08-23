import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateTeacherAssignmentDto {
  @ApiProperty({
    description: 'UUID del nuevo docente asignado a la materia',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El teacherId debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El teacherId no puede estar vacío.' })
  teacherId: string;
}
