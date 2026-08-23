import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TeacherAssignmentsService } from '../api/teacher-assignments.service'
import { SubjectsService } from '@/features/subjects/api/subjects.service'
import type { Classroom } from '@/features/classrooms/types/classrooms.types'
import type {
  CreateTeacherAssignmentPayload,
  CloneTeacherAssignmentsPayload,
} from '../types/teacher-assignments.types'

export const useClassroomAssignments = (classroom: Classroom | null, canManage: boolean) => {
  const queryClient = useQueryClient()

  // 1. Consultar asignaciones actuales de este curso
  const {
    data: assignmentsData,
    isLoading: isLoadingAssignments,
    isFetching: isFetchingAssignments,
  } = useQuery({
    queryKey: ['assignments', classroom?.id],
    queryFn: () => TeacherAssignmentsService.getAll({ classroomId: classroom?.id, limit: 50 }),
    enabled: !!classroom?.id,
    placeholderData: keepPreviousData,
    staleTime: 10 * 1000,
  })

  const assignments = assignmentsData?.data || []

  // 2. Consultar materias elegibles para este curso (filtradas por nivel)
  const { data: subjectsData, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects_filtered', classroom?.level],
    queryFn: () => SubjectsService.getAll(1, 100, undefined, classroom?.level),
    enabled: !!classroom?.level && canManage,
    staleTime: 5 * 60 * 1000,
  })

  const subjects = subjectsData?.data || []

  // 3. Mutación para crear una nueva asignación
  const assignMutation = useMutation({
    mutationFn: (payload: CreateTeacherAssignmentPayload) =>
      TeacherAssignmentsService.create(payload),
    onSuccess: () => {
      toast.success('DOCENTE ASIGNADO EXITOSAMENTE')
      queryClient.invalidateQueries({ queryKey: ['assignments', classroom?.id] })
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al asignar.'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  // 4. Mutación para eliminar una asignación
  const deleteMutation = useMutation({
    mutationFn: (id: string) => TeacherAssignmentsService.delete(id),
    onSuccess: () => {
      toast.success('ASIGNACIÓN ELIMINADA')
      queryClient.invalidateQueries({ queryKey: ['assignments', classroom?.id] })
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'No se pudo eliminar la asignación.'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  // 5. Mutación para reasignar docente
  const updateMutation = useMutation({
    mutationFn: ({ id, teacherId }: { id: string; teacherId: string }) =>
      TeacherAssignmentsService.update(id, { teacherId }),
    onSuccess: () => {
      toast.success('DOCENTE REASIGNADO EXITOSAMENTE')
      queryClient.invalidateQueries({ queryKey: ['assignments', classroom?.id] })
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al reasignar el docente.'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  // 6. Mutación para clonar una malla curricular
  const cloneMutation = useMutation({
    mutationFn: (payload: CloneTeacherAssignmentsPayload) =>
      TeacherAssignmentsService.clone(payload),
    onSuccess: (res) => {
      toast.success(`SE CLONARON ${res.clonedCount} ASIGNACIONES CON ÉXITO`)
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al clonar la carga horaria.'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  return {
    assignments,
    subjects,
    isLoading: isLoadingAssignments || isLoadingSubjects,
    isFetchingAssignments,
    assignMutation,
    updateMutation,
    deleteMutation,
    cloneMutation,
  }
}
