import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/enrollments')({
  beforeLoad: ({ context }) => {
    const canRead =
      context.can('read:all', 'Enrollment') ||
      context.can('read:own', 'Student') ||
      context.can('manage:all', 'all')

    if (!canRead) {
      toast.error('No tienes permisos para ver las inscripciones.')
      throw redirect({ to: '/dashboard' })
    }
  },
  component: Outlet,
  gcTime: 0,
})
