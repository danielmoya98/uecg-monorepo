import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { InstitutionsService } from '../api/institutions.service';
import type { AttendanceSettingsPayload } from '../types/institutions.types';

export const useAttendanceSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<AttendanceSettingsPayload, Error>({
    queryKey: ['attendanceSettings'],
    queryFn: InstitutionsService.getAttendanceSettings,
  });

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
