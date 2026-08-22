import { createLazyFileRoute } from '@tanstack/react-router'
import { SubjectsPage } from '@/features/subjects'

export const Route = createLazyFileRoute('/_authenticated/subjects')({
  component: SubjectsPage,
})
