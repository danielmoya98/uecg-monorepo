import { api } from '@/shared/api/client'
import type { User, CreateUserPayload, UpdateUserPayload, UsersResponse } from '../types/users.types'

export const UsersService = {
  getAll: async (
    page: number,
    limit: number,
    search: string,
    role?: string
  ): Promise<UsersResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search,
    })

    if (role && role !== 'Todos') {
      params.append('role', role)
    }

    const response = await api.get(`/users?${params.toString()}`)
    if (response.data && response.data.meta !== undefined) {
      return response.data
    }
    return response.data.data !== undefined ? response.data.data : response.data
  },

  create: async (data: CreateUserPayload): Promise<User> => {
    const response = await api.post('/users', data, {
      headers: {
        'x-idempotency-key': crypto.randomUUID(),
      },
    })
    return response.data.data !== undefined ? response.data.data : response.data
  },

  update: async (id: string, data: UpdateUserPayload): Promise<User> => {
    const response = await api.patch(`/users/${id}`, data)
    return response.data.data !== undefined ? response.data.data : response.data
  },

  delete: async (id: string): Promise<User> => {
    const response = await api.delete(`/users/${id}`)
    return response.data.data !== undefined ? response.data.data : response.data
  },

  reactivate: async (id: string): Promise<User> => {
    const response = await api.patch(`/users/${id}/reactivate`)
    return response.data.data !== undefined ? response.data.data : response.data
  },

  resetPassword: async (
    id: string
  ): Promise<{ id: string; fullName: string; email: string; newPassword: string }> => {
    const response = await api.post(
      `/users/${id}/reset-password`,
      {},
      {
        headers: {
          'x-idempotency-key': crypto.randomUUID(),
        },
      }
    )
    return response.data.data !== undefined ? response.data.data : response.data
  },
}
