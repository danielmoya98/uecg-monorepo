import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage, AuthService } from '@/features/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    let status: { isInitialized: boolean; hasUsers: boolean; hasInstitution: boolean } | null = null
    try {
      status = await AuthService.getSystemStatus()
    } catch {
      // API no disponible o arrancando en frío
    }

    if (status && !status.isInitialized) {
      throw redirect({
        to: '/setup-wizard' as any,
      })
    }
  },
  component: LoginPage,
})


