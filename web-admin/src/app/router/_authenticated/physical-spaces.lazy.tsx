import { createLazyFileRoute } from '@tanstack/react-router'
import { PhysicalSpacesPage } from '@/features/physical-spaces'

export const Route = createLazyFileRoute('/_authenticated/physical-spaces')({
  component: PhysicalSpacesPage,
})
