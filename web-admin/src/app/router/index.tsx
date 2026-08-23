import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage, AuthService } from '@/features/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    try {
      const status = await AuthService.getSystemStatus()
      if (!status.isInitialized) {
        throw redirect({
          to: '/setup-wizard' as any,
        })
      }
    } catch (e: any) {
      if (e?.to || e?.isRedirect) throw e
    }
  },
  component: LoginPage,
})

