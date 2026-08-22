import { api } from '@/shared/api/client'
import type { Trimester } from '../types/academic-years.types'

export const TrimestersService = {
  getByAcademicYear: async (academicYearId: string): Promise<Trimester[]> => {
    const response = await api.get(`/trimesters/year/${academicYearId}`)
    return response.data
  },

  update: async (
    id: string,
    payload: { startDate?: string; endDate?: string; isOpen?: boolean }
  ): Promise<Trimester> => {
    const response = await api.patch(`/trimesters/${id}`, payload)
    return response.data
  },
}
