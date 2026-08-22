import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/academic-years')({
  // 🔥 Desestructuramos el método ABAC nativo del contexto síncrono
  beforeLoad: ({ context }) => {
    const canManage = context.can('manage:all', 'AcademicYear')

    if (!canManage) {
      toast.error('Acceso denegado a la Gestión Académica')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
