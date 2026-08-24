import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSocket } from '@/features/identity/providers/socket-provider';
import { InstitutionsService } from '../api/institutions.service';
import type { AttendanceSettingsPayload } from '../types/institutions.types';

export const useAttendanceSettings = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data: settings, isLoading } = useQuery<AttendanceSettingsPayload, Error>({
    queryKey: ['attendanceSettings'],
    queryFn: InstitutionsService.getAttendanceSettings,
  });

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceSettings'] });
    };
    socket.on('institution-updated', handleUpdate);
    return () => {
      socket.off('institution-updated', handleUpdate);
    };
  }, [socket, queryClient]);

  const mutation = useMutation<AttendanceSettingsPayload, Error, AttendanceSettingsPayload>({
    mutationFn: InstitutionsService.updateAttendanceSettings,
    onSuccess: () => {
      toast.success('REGLAS DE ASISTENCIA GUARDADAS');
      queryClient.invalidateQueries({ queryKey: ['attendanceSettings'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar las reglas de asistencia.');
    },
  });

  return {
    settings,
    isLoading,
    isSubmitting: mutation.isPending,
    saveSettings: mutation.mutate,
  };
};
