import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/classrooms')({
  beforeLoad: ({ context }) => {
    const canManageClassrooms = context.can('manage:all', 'Classroom')

    if (!canManageClassrooms) {
      toast.error('ACCESO DENEGADO A LA GESTIÓN DE AULAS Y CURSOS')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
