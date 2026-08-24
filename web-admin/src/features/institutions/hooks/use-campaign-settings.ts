import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSocket } from '@/features/identity/providers/socket-provider';
import { InstitutionsService } from '../api/institutions.service';
import type { CampaignSettingsPayload } from '../types/institutions.types';

export const useCampaignSettings = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data: settings, isLoading } = useQuery<CampaignSettingsPayload, Error>({
    queryKey: ['campaignSettings'],
    queryFn: InstitutionsService.getCampaignSettings,
  });

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['campaignSettings'] });
    };
    socket.on('institution-updated', handleUpdate);
    return () => {
      socket.off('institution-updated', handleUpdate);
    };
  }, [socket, queryClient]);

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
