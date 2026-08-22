import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/timetables')({
  beforeLoad: ({ context }) => {
    // 🛡️ Escudo de seguridad ABAC en el enrutador para proteger la Matriz de Horarios
    const canReadTimetables =
      context.can('manage:all', 'Timetable') ||
      context.can('read:all', 'Timetable') ||
      context.can('read:own', 'Timetable') ||
      context.can('manage:all', 'all')

    if (!canReadTimetables) {
      toast.error('ACCESO DENEGADO A LA MATRIZ DE HORARIOS')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
