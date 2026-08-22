import { ApiProperty } from '@nestjs/swagger';

export class DashboardTeacherStatsDto {
  @ApiProperty({
    example: '08:00',
    description: 'Hora de inicio de la siguiente clase del docente',
  })
  nextClassTime: string;

  @ApiProperty({
    example: 'Matemáticas',
    description: 'Nombre de la materia de la siguiente clase',
  })
  nextSubject: string;

  @ApiProperty({
    example: '3ro A',
    description: 'Grado y sección de la siguiente clase',
  })
  nextGroup: string;

  @ApiProperty({
    example: 40,
    description: 'Número total de alumnos únicos a cargo del docente',
  })
  studentsCount: number;

  @ApiProperty({
    example: 'Al día',
    description: 'Estado diario de control de asistencia',
  })
  attendanceStatus: string;

  @ApiProperty({
    example: '1er Trimestre',
    description: 'Nombre del trimestre activo actual en el sistema',
  })
  currentTrimester: string;
}
