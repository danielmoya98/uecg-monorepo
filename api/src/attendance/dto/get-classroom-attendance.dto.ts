import { IsNotEmpty, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetClassroomAttendanceDto {
  @ApiProperty({
    description: 'UUID del aula/curso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El classroomId debe ser un UUID válido.' })
  @IsNotEmpty()
  classroomId: string;

  @ApiProperty({
    description: 'UUID del periodo de clase',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID('4', { message: 'El classPeriodId debe ser un UUID válido.' })
  @IsNotEmpty()
  classPeriodId: string;

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
}
