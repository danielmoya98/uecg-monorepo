import { createLazyFileRoute } from '@tanstack/react-router'
import { RbacPage } from '@/features/rbac'

export const Route = createLazyFileRoute('/_authenticated/rbac')({
  component: RbacPage,
})
