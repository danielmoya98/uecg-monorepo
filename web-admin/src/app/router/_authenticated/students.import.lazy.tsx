import { createLazyFileRoute } from '@tanstack/react-router'
import ImportStudentsPage from '@/features/students/components/import-students-page'

export const Route = createLazyFileRoute('/_authenticated/students/import')({
  component: ImportStudentsPage,
})
