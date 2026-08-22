import { api } from '@/shared/api/client'
import type { ClassPeriod, ClassPeriodPayload, ShiftType } from '../types/class-periods.types'

export const ClassPeriodsService = {
  getAll: async (shift?: ShiftType): Promise<ClassPeriod[]> => {
    const params = shift ? { shift } : {}
    const response = await api.get<ClassPeriod[]>('/class-periods', { params })
    return response.data
  },

  create: async (payload: ClassPeriodPayload): Promise<ClassPeriod> => {
    const response = await api.post<ClassPeriod>('/class-periods', payload)
    return response.data
  },

  update: async (id: string, payload: Partial<ClassPeriodPayload>): Promise<ClassPeriod> => {
    const response = await api.patch<ClassPeriod>(`/class-periods/${id}`, payload)
    return response.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/class-periods/${id}`)
  },
}
