import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TrimestersService } from '../api/trimesters.service'
import type { Trimester } from '../types/academic-years.types'

export const useTrimestersData = (academicYearId?: string, enabled = false) => {
  const queryClient = useQueryClient()

  // Consulta de los trimestres de la gestión seleccionada
  const { data: trimestersData, isLoading } = useQuery<Trimester[]>({
    queryKey: ['trimesters', academicYearId],
    queryFn: () => TrimestersService.getByAcademicYear(academicYearId!),
    enabled: !!academicYearId && enabled,
  })

  const trimestersList = Array.isArray(trimestersData) ? trimestersData : []

  // Mutación para actualizar fechas o estado de apertura de un trimestre
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { startDate?: string; endDate?: string; isOpen?: boolean }
    }) => TrimestersService.update(id, payload),
    onSuccess: () => {
      toast.success('Trimestre actualizado correctamente')
      queryClient.invalidateQueries({ queryKey: ['trimesters', academicYearId] })
      queryClient.invalidateQueries({ queryKey: ['currentAcademicYear'] })
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } }
      const msg = err.response?.data?.message || 'Error al actualizar el trimestre'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  return {
    trimestersList,
    isLoading,
    updateTrimester: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  }
}
