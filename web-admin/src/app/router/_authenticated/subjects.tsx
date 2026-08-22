import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/subjects')({
  beforeLoad: ({ context }) => {
    // 🛡️ Escudo de seguridad ABAC en enrutador para proteger acceso a materias
    const canReadSubjects =
      context.can('manage:all', 'Subject') ||
      context.can('read:all', 'Subject') ||
      context.can('manage:all', 'all')

    if (!canReadSubjects) {
      toast.error('ACCESO DENEGADO A LA GESTIÓN DE MATERIAS')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
