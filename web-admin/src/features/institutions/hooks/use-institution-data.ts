import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useSocket } from '@/features/identity/providers/socket-provider';
import { InstitutionsService } from '../api/institutions.service';
import type { Institution, InstitutionPayload } from '../types/institutions.types';

interface ApiErrorResponse {
  error?: {
    message?: string | string[];
  };
  message?: string | string[];
}

export const useInstitutionData = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data: currentInstitution, isLoading } = useQuery<Institution | null, Error>({
    queryKey: ['currentInstitution'],
    queryFn: InstitutionsService.getCurrent,
  });

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['currentInstitution'] });
    };
    socket.on('institution-updated', handleUpdate);
    return () => {
      socket.off('institution-updated', handleUpdate);
    };
  }, [socket, queryClient]);

  const saveMutation = useMutation<Institution, Error, InstitutionPayload>({
    mutationFn: (payload: InstitutionPayload) => {
      if (currentInstitution?.id) {
        return InstitutionsService.update(currentInstitution.id, payload);
      }
      return InstitutionsService.create(payload);
    },
    onSuccess: () => {
      toast.success(
        currentInstitution ? 'DATOS INSTITUCIONALES ACTUALIZADOS' : 'INSTITUCIÓN REGISTRADA EN EL SISTEMA'
      );
      queryClient.invalidateQueries({ queryKey: ['currentInstitution'] });
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const responseData = axiosError.response?.data;
      const errorMessage =
        responseData?.error?.message || responseData?.message || error.message || 'Ocurrió un error al guardar';
      toast.error(typeof errorMessage === 'string' ? errorMessage : errorMessage[0]);
    },
  });

  return {
    currentInstitution,
    isLoading,
    isSubmitting: saveMutation.isPending,
    saveInstitution: saveMutation.mutate,
  };
};
