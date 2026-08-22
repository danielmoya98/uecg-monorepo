import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { InstitutionsService } from '../api/institutions.service';
import type { CampaignSettingsPayload } from '../types/institutions.types';

export const useCampaignSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<CampaignSettingsPayload, Error>({
    queryKey: ['campaignSettings'],
    queryFn: InstitutionsService.getCampaignSettings,
  });

  const mutation = useMutation<CampaignSettingsPayload, Error, CampaignSettingsPayload>({
    mutationFn: InstitutionsService.updateCampaignSettings,
    onSuccess: () => {
      toast.success('CONFIGURACIÓN DE LA CAMPAÑA GUARDADA');
      queryClient.invalidateQueries({ queryKey: ['campaignSettings'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar la configuración de campaña.');
    },
  });

  return {
    settings,
    isLoading,
    isSubmitting: mutation.isPending,
    saveSettings: mutation.mutate,
  };
};
