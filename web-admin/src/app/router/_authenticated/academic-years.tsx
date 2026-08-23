import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/academic-years')({
  // 🔥 Desestructuramos el método ABAC nativo del contexto síncrono
  beforeLoad: ({ context }) => {
    const canAccess =
      context.can('manage:all', 'AcademicYear') ||
      context.can('read:all', 'AcademicYear') ||
      context.can('manage:all', 'all')

    if (!canAccess) {
      toast.error('Acceso denegado a la Gestión Académica')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
