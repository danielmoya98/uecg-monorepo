import { api } from '@/shared/api/client'
import type {
  CreateSlotPayload,
  PeriodsResponse,
  ScheduleResponse,
  TimetableSlot,
} from '../types/timetables.types'

export const TimetablesService = {
  /**
   * Obtiene los periodos/bloques horarios para un turno específico.
   */
  getPeriods: async (shift: string): Promise<PeriodsResponse> => {
    const response = await api.get(`/timetables/periods`, {
      params: { shift },
    })
    return response.data
  },

  /**
   * Obtiene la matriz de horarios asignados a una aula específica.
   */
  getClassroomSchedule: async (classroomId: string): Promise<ScheduleResponse> => {
    const response = await api.get(`/timetables/classroom/${classroomId}`)
    return response.data
  },

  /**
   * Asigna una materia a un bloque horario en el aula especificada (Slot).
   */
  createSlot: async (data: CreateSlotPayload): Promise<TimetableSlot> => {
    const response = await api.post('/timetables/slot', data, {
      headers: { 'x-idempotency-key': crypto.randomUUID() },
    })
    return response.data.data !== undefined ? response.data.data : response.data
  },

  /**
   * Elimina una materia de un bloque horario específico.
   */
  removeSlot: async (id: string): Promise<void> => {
    const response = await api.delete(`/timetables/slot/${id}`)
    return response.data.data !== undefined ? response.data.data : response.data
  },

  /**
   * Actualiza el espacio físico asignado a un bloque de clases (Slot).
   */
  updateSlotSpace: async (id: string, physicalSpaceId: string | null): Promise<TimetableSlot> => {
    const response = await api.patch(`/timetables/slot/${id}/space`, { physicalSpaceId })
    return response.data.data !== undefined ? response.data.data : response.data
  },
}
