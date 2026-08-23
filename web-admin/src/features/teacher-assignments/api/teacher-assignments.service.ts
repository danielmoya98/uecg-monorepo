import { api } from '@/shared/api/client'
import type {
  TeacherAssignmentsResponse,
  CreateTeacherAssignmentPayload,
  CloneTeacherAssignmentsPayload,
  CloneResponse,
  TeacherAssignment,
} from '../types/teacher-assignments.types'

export const TeacherAssignmentsService = {
  getAll: async (params: {
    page?: number
    limit?: number
    classroomId?: string
    teacherId?: string
    academicYearId?: string
  }): Promise<TeacherAssignmentsResponse> => {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page.toString())
    if (params.limit) query.append('limit', params.limit.toString())
    if (params.classroomId) query.append('classroomId', params.classroomId)
    if (params.teacherId) query.append('teacherId', params.teacherId)
    if (params.academicYearId) query.append('academicYearId', params.academicYearId)

    const response = await api.get(`/teacher-assignments?${query.toString()}`)
    return response.data
  },

  clone: async (data: CloneTeacherAssignmentsPayload): Promise<CloneResponse> => {
    const response = await api.post('/teacher-assignments/clone', data, {
      headers: {
        'x-idempotency-key': crypto.randomUUID(),
      },
    })
    return response.data.data !== undefined ? response.data.data : response.data
  },

  create: async (data: CreateTeacherAssignmentPayload): Promise<TeacherAssignment> => {
    const response = await api.post('/teacher-assignments', data, {
      headers: {
        'x-idempotency-key': crypto.randomUUID(),
      },
    })
    return response.data.data !== undefined ? response.data.data : response.data
  },

  update: async (
    id: string,
    data: { teacherId: string },
  ): Promise<TeacherAssignment> => {
    const response = await api.patch(`/teacher-assignments/${id}`, data, {
      headers: {
        'x-idempotency-key': crypto.randomUUID(),
      },
    })
    return response.data.data !== undefined ? response.data.data : response.data
  },

  delete: async (id: string): Promise<TeacherAssignment> => {
    const response = await api.delete(`/teacher-assignments/${id}`)
    return response.data.data !== undefined ? response.data.data : response.data
  },
}
