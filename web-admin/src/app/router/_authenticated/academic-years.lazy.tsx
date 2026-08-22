import { createLazyFileRoute } from '@tanstack/react-router'
import { AcademicYearsPage } from '@/features/academic-years'

export const Route = createLazyFileRoute('/_authenticated/academic-years')({
  component: AcademicYearsPage,
})
