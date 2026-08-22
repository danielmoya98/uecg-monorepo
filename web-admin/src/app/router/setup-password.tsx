import { createFileRoute } from '@tanstack/react-router'

import { SetupPasswordPage } from '@/features/auth'

export const Route = createFileRoute(
  '/setup-password',
)({
  component: SetupPasswordPage,
})
