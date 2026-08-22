import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/students/import')({
  beforeLoad: ({ context }) => {
    // 🛡️ Escudo de seguridad ABAC para la migración de Excel
    const canCreateStudent =
      context.can('create:any', 'Student') ||
      context.can('manage:all', 'all')

    if (!canCreateStudent) {
      toast.error('No tienes permisos para realizar importaciones masivas.')
      throw redirect({ to: '/students' })
    }
  },
  gcTime: 0,
})
