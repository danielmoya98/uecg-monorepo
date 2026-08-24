import { api } from '@/shared/api/client'
import type { AcademicYearData, AcademicYearPayload } from '../types/academic-years.types'

export interface AcademicYearsResponse {
  data: AcademicYearData[]
  meta: {
    total: number
    totalPages: number
  }
}

export const AcademicYearsService = {
  /**
   * Obtiene la lista paginada y filtrada de todas las gestiones escolares registradas.
   */
  getAll: async (page: number, limit: number, search: string): Promise<AcademicYearsResponse> => {
    const response = await api.get('/academic-years', {
      params: {
        page,
        limit,
        search,
      },
    })
    return response.data
  },

  /**
   * Obtiene los datos detallados de la gestión académica que se encuentra activa actualmente.
   */
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   getCurrent: async (): Promise<any> => {
     const response = await api.get('/academic-years/current')
     return response.data
   },

  /**
   * Obtiene el diagnóstico y progreso de preparación de la gestión escolar (Setup Wizard).
   */
  getReadiness: async (academicYearId?: string): Promise<import('../types/academic-years.types').AcademicYearReadinessResponse> => {
    const response = await api.get('/academic-years/readiness', {
      params: academicYearId ? { academicYearId } : {},
    })
    return response.data
  },

  /**
   * Registra una nueva gestión académica en el sistema.
   */
  create: async (payload: AcademicYearPayload): Promise<AcademicYearData> => {
    const response = await api.post('/academic-years', payload)
    return response.data
  },

  /**
   * Actualiza los datos o el estado operativo de una gestión específica.
   */
  update: async (id: string, payload: Partial<AcademicYearPayload>): Promise<AcademicYearData> => {
    const response = await api.patch(`/academic-years/${id}`, payload)
    return response.data
  },

  /**
   * Elimina de forma lógica o física una gestión del calendario (Solo permitido en estado PLANNING).
   */
  delete: async (id: string): Promise<AcademicYearData> => {
    const response = await api.delete(`/academic-years/${id}`)
    return response.data
  },

  /**
   * 🛡️ Pre-validación de Integridad: Verifica si la gestión cumple condiciones para ser clausurada.
   */
  checkCanClose: async (id: string): Promise<{
    canClose: boolean
    openTrimesters: string[]
    pendingDataUpdatesCount: number
    reasons: string[]
  }> => {
    const response = await api.get(`/academic-years/${id}/can-close`)
    return response.data
  },

  /**
   * 🔄 Clonación Atómica de Estructura: Copia cursos y carga horaria desde un año origen.
   */
  cloneStructure: async (
    targetYearId: string,
    payload: {
      sourceYearId: string
      cloneAssignments?: boolean
      cloneBaseRooms?: boolean
    }
  ): Promise<{
    message: string
    sourceYear: number
    targetYear: number
    clonedClassroomsCount: number
    clonedAssignmentsCount: number
  }> => {
    const response = await api.post(
      `/academic-years/${targetYearId}/clone-structure`,
      payload
    )
    return response.data
  },
}
