import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/data-updates')({
  beforeLoad: ({ context }) => {
    const canReadRude = context.can('read:all', 'Student') || context.can('manage:all', 'all')

    if (!canReadRude) {
      toast.error('Acceso denegado a la Bandeja RUDE')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
