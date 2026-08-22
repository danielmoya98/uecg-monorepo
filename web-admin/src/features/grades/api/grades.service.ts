import { api } from '@/shared/api/client'
import type {
  StudentGradeRowData,
  UpsertGradePayload,
  BulkGradesPayload,
  ChangeRequest,
  ChangeRequestPayload,
} from '../types/grades.types'

export const GradesService = {
  getGradesByAssignment: async (
    assignmentId: string,
    trimesterId: string,
  ): Promise<StudentGradeRowData[]> => {
    const response = await api.get(`/grades/assignment/${assignmentId}/trimester/${trimesterId}`)
    return response.data.data !== undefined ? response.data.data : response.data
  },

  upsertGrade: async (payload: UpsertGradePayload): Promise<unknown> => {
    const response = await api.put('/grades', payload)
    return response.data
  },

  updateBulkGrades: async (payload: BulkGradesPayload): Promise<{ message: string }> => {
    const response = await api.patch('/grades/bulk', payload)
    return response.data
  },

  createChangeRequest: async (payload: ChangeRequestPayload): Promise<unknown> => {
    const response = await api.post('/grades/change-requests', payload)
    return response.data
  },

  getPendingRequests: async (): Promise<ChangeRequest[]> => {
    const response = await api.get('/grades/change-requests/pending')
    return response.data.data !== undefined ? response.data.data : response.data
  },

  resolveChangeRequest: async (
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
  ): Promise<unknown> => {
    const response = await api.patch(`/grades/change-requests/${requestId}/resolve`, { status })
    return response.data
  },
}
