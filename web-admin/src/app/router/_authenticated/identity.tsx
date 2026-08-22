import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/identity')({
  // 🛡️ Guardia de Seguridad ABAC síncrono nativo del Router
  beforeLoad: ({ context }) => {
    const canManage = context.can('create:any', 'Identity') || context.can('manage:all', 'all')

    if (!canManage) {
      toast.error('No tienes permisos para acceder al Centro de Carnetización.')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
