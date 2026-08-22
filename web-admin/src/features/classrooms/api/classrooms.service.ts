import { api } from '@/shared/api/client'
import type {
  Classroom,
  ClassroomPayload,
  BulkClassroomPayload,
  BulkClassroomResponse,
} from '../types/classrooms.types'

export interface ClassroomsResponse {
  data: Classroom[]
  meta: {
    total: number
    totalPages: number
  }
}

export const ClassroomsService = {
  getAll: async (
    page: number,
    limit: number,
    search?: string,
    academicYearId?: string,
    level?: string,
    shift?: string
  ): Promise<ClassroomsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (search) params.append('search', search)
    if (academicYearId) params.append('academicYearId', academicYearId)
    if (level) params.append('level', level)
    if (shift) params.append('shift', shift)

    const response = await api.get(`/classrooms?${params.toString()}`)
    return response.data
  },

  create: async (data: ClassroomPayload): Promise<Classroom> => {
    const response = await api.post('/classrooms', data, {
      headers: {
        'x-idempotency-key': crypto.randomUUID(),
      },
    })
    return response.data.data !== undefined ? response.data.data : response.data
  },

  update: async (id: string, data: Partial<ClassroomPayload>): Promise<Classroom> => {
    const response = await api.patch(`/classrooms/${id}`, data)
    return response.data.data !== undefined ? response.data.data : response.data
  },

  delete: async (id: string): Promise<Classroom> => {
    const response = await api.delete(`/classrooms/${id}`)
    return response.data.data !== undefined ? response.data.data : response.data
  },

  createBulk: async (data: BulkClassroomPayload): Promise<BulkClassroomResponse> => {
    const response = await api.post('/classrooms/bulk', data, {
      headers: {
        'x-idempotency-key': crypto.randomUUID(),
      },
    })
    return response.data.data !== undefined ? response.data.data : response.data
  },
}
