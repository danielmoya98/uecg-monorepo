import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '../../../prisma/generated/client';

export class ImportStudentsDto {
  @ApiProperty({
    enum: EnrollmentStatus,
    description: 'Estado global de los estudiantes importados',
    example: 'INSCRITO',
  })
  @IsEnum(EnrollmentStatus, {
    message: 'El estado debe ser un valor de EnrollmentStatus válido.',
  })
  @IsNotEmpty()
  status: EnrollmentStatus;

  @ApiProperty({
    description: 'UUID del curso destino (Classroom)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El classroomId debe ser un UUID válido.' })
  @IsNotEmpty()
  classroomId: string;
}
