import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/settings')({
  // 🔥 Validación directa contra el motor contextual
  beforeLoad: ({ context }) => {
    const canManageInstitution = context.can('manage:all', 'Institution')

    if (!canManageInstitution) {
      toast.error('Acceso denegado a la Configuración Global')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
