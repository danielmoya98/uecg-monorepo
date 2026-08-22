import { api } from '@/shared/api/client'
import type { Subject, SubjectPayload, SubjectsResponse } from '../types/subjects.types'

export const SubjectsService = {
  getAll: async (
    page: number,
    limit: number,
    search?: string,
    level?: string
  ): Promise<SubjectsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (search) params.append('search', search)
    if (level) params.append('level', level)

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

  delete: async (id: string): Promise<Subject> => {
    const response = await api.delete(`/subjects/${id}`)
    return response.data
  },
}
