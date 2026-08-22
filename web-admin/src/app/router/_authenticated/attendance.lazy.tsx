import { createLazyFileRoute } from '@tanstack/react-router'
import { AttendancePage } from '@/features/attendance'

export const Route = createLazyFileRoute('/_authenticated/attendance')({
  component: AttendancePage,
})
