import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/attendance')({
  beforeLoad: ({ context }) => {
    const hasAccess =
      context.can('create:own', 'Attendance') ||
      context.can('read:all', 'Attendance') ||
      context.can('manage:all', 'Attendance')

    if (!hasAccess) {
      toast.error('Acceso denegado al Control de Asistencia')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
