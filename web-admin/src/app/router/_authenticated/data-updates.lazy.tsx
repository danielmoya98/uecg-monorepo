import { createLazyFileRoute } from '@tanstack/react-router'
import { DataUpdatesPage } from '@/features/data-updates'

export const Route = createLazyFileRoute('/_authenticated/data-updates')({
  component: DataUpdatesPage,
})
