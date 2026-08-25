import { createFileRoute } from '@tanstack/react-router';
import { PublicRudeFormPage } from '@/features/data-updates';

export const Route = createFileRoute('/actualizar-datos/$token')({
  component: PublicRudeFormPage,
});
