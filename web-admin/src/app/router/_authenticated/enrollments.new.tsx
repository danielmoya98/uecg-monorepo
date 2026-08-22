import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/enrollments/new')({
  beforeLoad: ({ context }) => {
    const canManage =
      context.can('write:any', 'Enrollment') ||
      context.can('manage:all', 'all')

    if (!canManage) {
      toast.error('No tienes autorización para acceder a la Ventanilla de Inscripciones.')
      throw redirect({ to: '/enrollments' })
    }
  },
  gcTime: 0,
})
