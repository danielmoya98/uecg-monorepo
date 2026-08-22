import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/rbac')({
  // 🔥 ESCUDO DE INFRAESTRUCTURA DE RUTA: Bloquea síncronamente antes del montaje visual
  beforeLoad: ({ context }) => {
    const canManageRoles = context.can('manage:all', 'Role')

    if (!canManageRoles) {
      toast.error('ACCESO DENEGADO AL CONTROL DE ACCESOS (RBAC)')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
