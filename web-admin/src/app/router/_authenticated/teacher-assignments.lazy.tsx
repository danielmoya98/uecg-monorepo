import { createLazyFileRoute } from '@tanstack/react-router'
import { TeacherAssignmentsPage } from '@/features/teacher-assignments'

export const Route = createLazyFileRoute('/_authenticated/teacher-assignments')({
  component: TeacherAssignmentsPage,
})
