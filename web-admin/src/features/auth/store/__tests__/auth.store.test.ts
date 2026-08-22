import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../auth.store'
import type { AuthUser } from '../../types/auth.types'

describe('useAuthStore store', () => {
  const mockUser: AuthUser = {
    id: 'user-123',
    fullName: 'Juan Perez',
    email: 'juan@uecg.edu.bo',
    role: 'ADMIN',
    permissions: ['manage:all:all'],
  }

  beforeEach(() => {
    localStorage.clear()
    useAuthStore.getState().clearUser()
  })

  it('debe tener un valor inicial nulo', () => {
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('debe guardar el usuario con setUser y escribir en localStorage', () => {
    useAuthStore.getState().setUser(mockUser)
    
    expect(useAuthStore.getState().user).toEqual(mockUser)
    expect(localStorage.getItem('uecg_user')).toBe(JSON.stringify(mockUser))
  })

  it('debe limpiar el usuario con clearUser y remover de localStorage', () => {
    useAuthStore.getState().setUser(mockUser)
    localStorage.setItem('uecg_setup_token', 'temp-token')
    
    useAuthStore.getState().clearUser()

    expect(useAuthStore.getState().user).toBeNull()
    expect(localStorage.getItem('uecg_user')).toBeNull()
    expect(localStorage.getItem('uecg_setup_token')).toBeNull()
  })
})
