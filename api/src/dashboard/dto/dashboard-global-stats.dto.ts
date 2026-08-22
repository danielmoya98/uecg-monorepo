import { ApiProperty } from '@nestjs/swagger';

export class DashboardGlobalStatsDto {
  @ApiProperty({
    example: 500,
    description: 'Número total de estudiantes inscritos en la gestión activa',
  })
  students: number;

  @ApiProperty({
    example: 35,
    description:
      'Número total de docentes con carga horaria en la gestión activa',
  })
  teachers: number;

  @ApiProperty({
    example: 20,
    description: 'Número total de cursos/aulas en la gestión activa',
  })
  classrooms: number;

  @ApiProperty({
    example: '2026-06-17',
    description: 'Fecha de la última actualización institucional (RUE Sync)',
  })
  lastSync: string;
}
