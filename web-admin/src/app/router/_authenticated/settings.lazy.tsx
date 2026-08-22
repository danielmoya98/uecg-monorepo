import { createLazyFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/features/institutions';

export const Route = createLazyFileRoute('/_authenticated/settings')({
  component: SettingsPage,
});
