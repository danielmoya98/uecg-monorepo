import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ClassPeriodsService } from '../api/class-periods.service'
import type { ClassPeriod, ClassPeriodPayload, ShiftType } from '../types/class-periods.types'

export const useClassPeriodsData = (initialShift: ShiftType = 'MANANA') => {
  const queryClient = useQueryClient()
  const [selectedShift, setSelectedShift] = useState<ShiftType>(initialShift)

  const { data: periods = [], isLoading } = useQuery<ClassPeriod[]>({
    queryKey: ['classPeriods', selectedShift],
    queryFn: () => ClassPeriodsService.getAll(selectedShift),
  })

  const createMutation = useMutation({
    mutationFn: (data: ClassPeriodPayload) => ClassPeriodsService.create(data),
    onSuccess: () => {
      toast.success('Periodo agregado correctamente.')
      queryClient.invalidateQueries({ queryKey: ['classPeriods'] })
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } }
      const msg = err.response?.data?.message || 'Error al agregar el periodo.'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => ClassPeriodsService.remove(id),
    onSuccess: () => {
      toast.success('Periodo eliminado correctamente.')
      queryClient.invalidateQueries({ queryKey: ['classPeriods'] })
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } }
      const msg = err.response?.data?.message || 'Error al eliminar el periodo.'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  return {
    selectedShift,
    setSelectedShift,
    periods,
    isLoading,
    createMutation,
    removeMutation,
  }
}
