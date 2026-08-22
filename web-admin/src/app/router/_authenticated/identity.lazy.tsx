import { createLazyFileRoute } from '@tanstack/react-router'
import { IdentityCommandCenter } from '@/features/identity'

export const Route = createLazyFileRoute('/_authenticated/identity')({
  component: IdentityCommandCenter,
})
