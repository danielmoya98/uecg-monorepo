import { createLazyFileRoute } from '@tanstack/react-router'
import { UsersPage } from '@/features/users'

export const Route = createLazyFileRoute('/_authenticated/users')({
  component: UsersPage,
})
