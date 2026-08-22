import { createLazyFileRoute } from '@tanstack/react-router'
import { ClassroomsPage } from '@/features/classrooms'

export const Route = createLazyFileRoute('/_authenticated/classrooms')({
  component: ClassroomsPage,
})
