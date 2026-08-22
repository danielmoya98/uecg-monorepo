import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/grades')({
  beforeLoad: ({ context }) => {
    // 🛡️ Guardia síncrona ABAC de libreta de notas en la pasarela de la ruta
    const canReadGrades =
      context.can('manage:all', 'all') ||
      context.can('read:all', 'Grade') ||
      context.can('update:own', 'Grade')

    if (!canReadGrades) {
      toast.error('ACCESO DENEGADO A LAS PLANILLAS DE CALIFICACIONES')
      throw redirect({ to: '/dashboard' })
    }
  },
  gcTime: 0,
})
