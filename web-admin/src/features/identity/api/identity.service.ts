import { api } from '@/shared/api/client'
import type { QRAccessResult, MassExportFilters } from '../types/identity.types'

export const IdentityService = {
  getStudentQR: async (studentId: string): Promise<QRAccessResult> => {
    const response = await api.get(`/identity/qr/${studentId}`)
    // 🔥 CORRECCIÓN: Desempaquetado del interceptor de NestJS
    return response.data.data !== undefined ? response.data.data : response.data
  },

  generateQR: async (studentId: string): Promise<QRAccessResult> => {
    const response = await api.post(`/identity/generate/${studentId}`)
    return response.data.data !== undefined ? response.data.data : response.data
  },

  revokeQR: async (studentId: string): Promise<QRAccessResult> => {
    const response = await api.post(`/identity/revoke/${studentId}`)
    return response.data.data !== undefined ? response.data.data : response.data
  },

  exportMassive: async (
    academicYearId: string,
    filters: MassExportFilters
  ): Promise<{ message: string }> => {
    const response = await api.post(`/identity/export/mass/${academicYearId}`, filters)
    return response.data.data !== undefined ? response.data.data : response.data
  },
}
