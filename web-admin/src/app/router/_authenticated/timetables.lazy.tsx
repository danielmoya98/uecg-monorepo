import { createLazyFileRoute } from '@tanstack/react-router'
import { TimetablesPage } from '@/features/timetables'

export const Route = createLazyFileRoute('/_authenticated/timetables')({
  component: TimetablesPage,
})
