import { api } from '@/shared/api/client'
import type { Subject, SubjectPayload, SubjectsResponse } from '../types/subjects.types'

export const SubjectsService = {
  getAll: async (
    page: number,
    limit: number,
    search?: string,
    level?: string,
    isActive?: boolean,
    all?: boolean
  ): Promise<SubjectsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (search) params.append('search', search)
    if (level) params.append('level', level)
    if (typeof isActive === 'boolean') params.append('isActive', isActive.toString())
    if (all) params.append('all', 'true')

    const response = await api.get(`/subjects?${params.toString()}`)
    return response.data
  },

  create: async (data: SubjectPayload): Promise<Subject> => {
    const response = await api.post('/subjects', data, {
      headers: {
        'x-idempotency-key': crypto.randomUUID(),
      },
    })
    return response.data
  },

  update: async (id: string, data: Partial<SubjectPayload>): Promise<Subject> => {
    const response = await api.patch(`/subjects/${id}`, data)
    return response.data
  },

  toggleStatus: async (id: string, isActive?: boolean): Promise<Subject> => {
    const response = await api.patch(`/subjects/${id}/status`, { isActive })
    return response.data
  },

  delete: async (id: string): Promise<Subject> => {
    const response = await api.delete(`/subjects/${id}`)
    return response.data
  },
}

