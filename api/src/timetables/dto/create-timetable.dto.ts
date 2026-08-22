import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la creación de un Horario.
 * Nota: En el diseño actual, el horario se genera e infiere de forma automática
 * mediante periodos y casilleros de asignación (ScheduleSlot).
 */
export class CreateTimetableDto {
  @ApiPropertyOptional({ description: 'Comentarios adicionales del horario' })
  notes?: string;
}
