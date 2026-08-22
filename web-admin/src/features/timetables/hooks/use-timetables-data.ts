import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import { TimetablesService } from '../api/timetables.service'
import { TeacherAssignmentsService } from '@/features/teacher-assignments/api/teacher-assignments.service'
import type { CreateSlotPayload } from '../types/timetables.types'

interface UseTimetablesDataParams {
  classroomId: string
  shift: string
  canManage: boolean
}

export function useTimetablesData({ classroomId, shift, canManage }: UseTimetablesDataParams) {
  const queryClient = useQueryClient()

  // 1. Consulta de Periodos de Clases (Reloj Escolar)
  const periodsQuery = useQuery({
    queryKey: ['periods', shift],
    queryFn: () => TimetablesService.getPeriods(shift),
    enabled: !!shift,
  })

  // 2. Consulta del Horario del Aula Actual
  const scheduleQuery = useQuery({
    queryKey: ['schedule', classroomId],
    queryFn: () => TimetablesService.getClassroomSchedule(classroomId),
    enabled: !!classroomId,
  })

  // 3. Consulta de Materias/Docentes Asignados (Banco de Materias - Solo si gestiona)
  const assignmentsQuery = useQuery({
    queryKey: ['assignments', classroomId],
    queryFn: () => TeacherAssignmentsService.getAll({ classroomId, limit: 100 }),
    enabled: !!classroomId && canManage,
  })

  // MUTACIONES
  // A. Crear Slot (Arrastrar de Banco a Grilla)
  const createSlotMutation = useMutation({
    mutationFn: (payload: CreateSlotPayload) => TimetablesService.createSlot(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', classroomId] })
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const apiMessage = error.response?.data?.message
      const displayMsg = typeof apiMessage === 'string' ? apiMessage : apiMessage?.[0] || 'Conflicto de disponibilidad'
      toast.error(displayMsg)
    },
  })

  // B. Eliminar Slot (Quitar de la Grilla)
  const deleteSlotMutation = useMutation({
    mutationFn: (id: string) => TimetablesService.removeSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', classroomId] })
      toast.success('Materia removida del horario.')
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const apiMessage = error.response?.data?.message
      const displayMsg = typeof apiMessage === 'string' ? apiMessage : apiMessage?.[0] || 'Error al remover bloque'
      toast.error(displayMsg)
    },
  })

  // C. Actualizar Aula del Slot (Espacio Físico)
  const updateSpaceMutation = useMutation({
    mutationFn: ({ id, physicalSpaceId }: { id: string; physicalSpaceId: string | null }) =>
      TimetablesService.updateSlotSpace(id, physicalSpaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', classroomId] })
      toast.success('Aula reasignada exitosamente.')
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const apiMessage = error.response?.data?.message
      const displayMsg = typeof apiMessage === 'string' ? apiMessage : apiMessage?.[0] || 'Error al reasignar aula'
      toast.error(displayMsg)
    },
  })

  const periods = periodsQuery.data || []
  const scheduleSlots = scheduleQuery.data || []
  const bankAssignments = assignmentsQuery.data?.data || []

  const isLoading =
    periodsQuery.isLoading ||
    scheduleQuery.isLoading ||
    (canManage && assignmentsQuery.isLoading)

  return {
    periods,
    scheduleSlots,
    bankAssignments,
    isLoading,
    createSlot: createSlotMutation.mutate,
    isCreating: createSlotMutation.isPending,
    deleteSlot: deleteSlotMutation.mutate,
    isDeleting: deleteSlotMutation.isPending,
    updateSpace: updateSpaceMutation.mutate,
    isUpdatingSpace: updateSpaceMutation.isPending,
  }
}
