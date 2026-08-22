import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/students')({
  beforeLoad: ({ context }) => {
    // 🛡️ Escudo de seguridad ABAC en el enrutador
    const canReadStudents =
      context.can('read:all', 'Student') ||
      context.can('read:own', 'Student') ||
      context.can('manage:all', 'all')

    if (!canReadStudents) {
      toast.error('No tienes permisos para acceder a Población Escolar.')
      throw redirect({ to: '/dashboard' })
    }
  },
  component: Outlet,
  gcTime: 0,
})
