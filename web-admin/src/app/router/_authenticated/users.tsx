import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/users')({
  beforeLoad: ({ context }) => {
    const canManageUsers = context.can('manage:all', 'User')

    if (!canManageUsers) {
      toast.error('ACCESO DENEGADO A LA ADMINISTRACIÓN DE USUARIOS')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
