import { createLazyFileRoute } from '@tanstack/react-router'
import StudentsPage from '@/features/students/components/students-page'

export const Route = createLazyFileRoute('/_authenticated/students/')({
  component: StudentsPage,
})
