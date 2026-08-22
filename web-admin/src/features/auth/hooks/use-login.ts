import { toast } from 'sonner'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { queryClient } from '@/app/providers/query-provider'
import { AuthService } from '../api/auth.service'
import type { AuthUser, LoginPayload, LoginResponse } from '../types/auth.types'

interface ApiError {
  message?: string | string[]
}

export function useLogin() {
  const navigate = useNavigate()
  const router = useRouter()

  return useMutation<LoginResponse, AxiosError<ApiError>, LoginPayload>({
    mutationFn: ({ email, password }) => AuthService.login(email, password),

    onSuccess: async (result) => {
      if (result.status === 'SETUP_REQUIRED') {
        toast.error(result.message ?? 'Cambio de clave requerido')
        localStorage.setItem('uecg_setup_token', result.setupToken!)
        navigate({ to: '/setup-password' })
        return
      }

      if (result.status === 'SUCCESS') {
        // 1. Guardamos la sesión (detona el storage-update automáticamente)
        AuthService.saveSessionMetadata(result.user as AuthUser)
        document.cookie = 'uecg_is_logged_in=true; path=/; max-age=28800; SameSite=Lax'

        // 2. Limpiamos la caché vieja de consultas
        queryClient.clear()

        // 3. Forzamos la re-evaluación síncrona
        await router.invalidate()

        toast.success(`Bienvenido ${result.user?.fullName}`)

        // 🟢 SOLUCIÓN SIN PARPADEO: Navegación suave interna por transiciones de memoria de la SPA
        navigate({ to: '/dashboard' })
      }
    },

    onError: (error) => {
      const message = error.response?.data?.message ?? 'Credenciales inválidas'
      toast.error(Array.isArray(message) ? message[0] : message)
    },
  })
}
