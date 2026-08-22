import { api } from '@/shared/api/client'
import type { PhysicalSpace, PhysicalSpacePayload } from '../types/physical-spaces.types'

export const PhysicalSpacesService = {
  getAll: async (
    search?: string,
    isActive?: boolean,
    type?: string
  ): Promise<PhysicalSpace[]> => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (type) params.append('type', type)
    if (isActive !== undefined) {
      params.append('isActive', String(isActive))
      params.append('activeOnly', String(isActive)) // Retrocompatible con el código antiguo
    }

    const response = await api.get(`/physical-spaces?${params.toString()}`)
    const result = response.data.data !== undefined ? response.data.data : response.data
    return Array.isArray(result) ? result : []
  },

  create: async (data: PhysicalSpacePayload): Promise<PhysicalSpace> => {
    const response = await api.post('/physical-spaces', data)
    const result = response.data.data !== undefined ? response.data.data : response.data
    return result
  },

  update: async (id: string, data: Partial<PhysicalSpacePayload>): Promise<PhysicalSpace> => {
    const response = await api.patch(`/physical-spaces/${id}`, data)
    const result = response.data.data !== undefined ? response.data.data : response.data
    return result
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete(`/physical-spaces/${id}`)
    return response.data
  },
}
