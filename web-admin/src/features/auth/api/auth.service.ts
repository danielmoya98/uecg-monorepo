import { api } from '@/shared/api/client'
import { queryClient } from '@/app/providers/query-provider'
import { router } from '@/app/router/router'
import { useAuthStore } from '../store/auth.store'

import type { AuthUser, LoginResponse } from '../types/auth.types'

export const AuthService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data.data ?? response.data
  },

  setupPassword: async (setupToken: string, newPassword: string) => {
    const response = await api.post('/auth/setup-password', { setupToken, newPassword })
    return response.data.data ?? response.data
  },

  createQrChallenge: async () => {
    const response = await api.post('/auth/qr-challenge')
    return response.data
  },

  getQrChallengeStatus: async (challengeId: string) => {
    const response = await api.get(`/auth/qr-challenge/${challengeId}/status`)
    return response.data
  },

  saveSessionMetadata: (user: AuthUser) => {
    useAuthStore.getState().setUser(user)
    // 🔥 NOTIFICADOR: Le avisa en el acto al AppRouter que ya hay un nuevo usuario en disco
    window.dispatchEvent(new Event('storage-update'))
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      useAuthStore.getState().clearUser()
      
      // Limpiamos la cookie de control reactivo
      document.cookie = 'uecg_is_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

      // Limpiamos memorias volátiles
      queryClient.clear()
      router.invalidate()

      // 🔥 NOTIFICADOR: Le avisa en el acto al AppRouter que el usuario se ha borrado
      window.dispatchEvent(new Event('storage-update'))

      // Volvemos de forma suave al login
      router.navigate({ to: '/' })
    }
  },
}
