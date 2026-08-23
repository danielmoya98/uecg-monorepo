import { createFileRoute } from '@tanstack/react-router'
import { SetupWizardPage } from '@/features/institutions'

export const Route = createFileRoute('/setup-wizard')({
  component: SetupWizardPage,
})
