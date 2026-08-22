import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/teacher-assignments')({
  beforeLoad: ({ context }) => {
    // 🛡️ Escudo de seguridad ABAC en enrutador para proteger acceso a Carga Horaria
    const canReadAssignments =
      context.can('manage:all', 'TeacherAssignment') ||
      context.can('read:all', 'TeacherAssignment') ||
      context.can('manage:all', 'all')

    if (!canReadAssignments) {
      toast.error('ACCESO DENEGADO A LA GESTIÓN DE CARGA HORARIA')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
