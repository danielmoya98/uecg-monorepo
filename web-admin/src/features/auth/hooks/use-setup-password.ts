import { toast } from 'sonner'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { AuthService } from '../api/auth.service'
import type { LoginResponse } from '../types/auth.types'

interface ApiError {
  message?: string | string[]
}

export function useSetupPassword() {
  const navigate = useNavigate()
  const router = useRouter()

  return useMutation<LoginResponse, AxiosError<ApiError>, { setupToken: string; newPassword: string }>({
    mutationFn: async ({
      setupToken,
      newPassword,
    }) =>
      AuthService.setupPassword(
        setupToken,
        newPassword,
      ),

    onSuccess: async (result) => {
      toast.success(
        'Contraseña actualizada',
      )

      localStorage.removeItem(
        'uecg_setup_token',
      )

      if (result?.user) {
        AuthService.saveSessionMetadata(result.user)
      }
      document.cookie = 'uecg_is_logged_in=true; path=/; max-age=28800; SameSite=Lax'

      await router.invalidate()

      navigate({
        to: '/dashboard',
      })
    },

    onError: (
      error: AxiosError<ApiError>,
    ) => {
      const message =
        error.response?.data?.message ??
        'Error al actualizar contraseña'

      toast.error(
        Array.isArray(message)
          ? message[0]
          : message,
      )
    },
  })
}
