import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/physical-spaces')({
  beforeLoad: ({ context }) => {
    // 🛡️ Escudo de seguridad ABAC en enrutador
    const canReadSpaces =
      context.can('manage:all', 'PhysicalSpace') ||
      context.can('read:all', 'PhysicalSpace') ||
      context.can('manage:all', 'all')

    if (!canReadSpaces) {
      toast.error('ACCESO DENEGADO A LA CONFIGURACIÓN DE INFRAESTRUCTURA')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
