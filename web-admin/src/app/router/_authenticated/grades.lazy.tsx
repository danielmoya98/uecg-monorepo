import { createLazyFileRoute } from '@tanstack/react-router'
import { GradesPage } from '@/features/grades'

export const Route = createLazyFileRoute('/_authenticated/grades')({
  component: GradesPage,
})
