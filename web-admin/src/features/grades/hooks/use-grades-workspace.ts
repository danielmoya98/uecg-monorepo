import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouteContext } from '@tanstack/react-router'
import { toast } from 'sonner'

import { AcademicYearsService } from '@/features/academic-years/api/academic-years.service'
import { ClassroomsService } from '@/features/classrooms/api/classrooms.service'
import { TeacherAssignmentsService } from '@/features/teacher-assignments/api/teacher-assignments.service'
import { GradesService } from '../api/grades.service'
import type { GradeInput, BulkGradesPayload } from '../types/grades.types'

interface Trimester {
  id: string
  name: string
  isOpen: boolean
}

interface CurrentAcademicYear {
  id: string
  name: string
  trimesters: Trimester[]
}

export const useGradesWorkspace = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // 1. Sincronía pura con el contexto del enrutador ABAC
  const { can } = useRouteContext({ from: '/_authenticated' })
  const canManageGrades = can('read:all', 'Grade') || can('manage:all', 'all')
  const hasAccess = canManageGrades || can('update:own', 'Grade')

  useEffect(() => {
    if (!hasAccess) {
      toast.error('No tienes permisos para acceder a las Planillas de Calificación.')
      navigate({ to: '/dashboard', replace: true })
    }
  }, [hasAccess, navigate])

  // 2. Estado de Filtros
  const [selectedTrimester, setSelectedTrimester] = useState<string>('')
  const [selectedClassroom, setSelectedClassroom] = useState<string>('')
  const [selectedAssignment, setSelectedAssignment] = useState<string>('')

  // 3. Diccionario de Notas Locales
  const [gradesDict, setGradesDict] = useState<Record<string, GradeInput>>({})

  // 4. Consultas a la API
  const { data: currentYear } = useQuery<CurrentAcademicYear>({
    queryKey: ['currentAcademicYear'],
    queryFn: AcademicYearsService.getCurrent,
  })

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['pending-grade-change-requests'],
    queryFn: GradesService.getPendingRequests,
    refetchInterval: 30000,
    enabled: canManageGrades,
  })

  const { data: classroomsData } = useQuery({
    queryKey: ['classrooms', currentYear?.id],
    queryFn: () => ClassroomsService.getAll(1, 100, '', currentYear?.id),
    enabled: !!currentYear?.id,
  })

  const { data: assignmentsData } = useQuery({
    queryKey: ['assignments', selectedClassroom],
    queryFn: () => TeacherAssignmentsService.getAll({ classroomId: selectedClassroom }),
    enabled: !!selectedClassroom,
  })

  const { data: studentsGrades, isLoading: isGradesLoading } = useQuery({
    queryKey: ['grades', selectedAssignment, selectedTrimester],
    queryFn: () => GradesService.getGradesByAssignment(selectedAssignment, selectedTrimester),
    enabled: !!selectedAssignment && !!selectedTrimester,
  })

  // 5. Sincronización del Diccionario Local
  useEffect(() => {
    if (studentsGrades) {
      const initialDict: Record<string, GradeInput> = {}
      studentsGrades.forEach((s) => {
        initialDict[s.enrollmentId] = {
          ser: s.grade?.scoreSer?.toString() ?? '',
          saber: s.grade?.scoreSaber?.toString() ?? '',
          hacer: s.grade?.scoreHacer?.toString() ?? '',
          auto: s.grade?.scoreAuto?.toString() ?? '',
          recovery: s.grade?.recoveryScore?.toString() ?? '',
        }
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGradesDict(initialDict)
    }
  }, [studentsGrades])

  const handleScoreChange = (enrollmentId: string, field: keyof GradeInput, value: string) => {
    setGradesDict((prev) => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], [field]: value },
    }))
  }

  // 6. Mutación de Guardado Masivo
  const bulkSaveMutation = useMutation({
    mutationFn: (payload: BulkGradesPayload) => GradesService.updateBulkGrades(payload),
    onSuccess: (res) => {
      toast.success('¡Planilla Guardada Exitosamente!', { description: res.message })
      queryClient.invalidateQueries({
        queryKey: ['grades', selectedAssignment, selectedTrimester],
      })
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Error al guardar la planilla.')
    },
  })

  const handleBulkSave = () => {
    const payloadGrades = Object.entries(gradesDict).map(([enrollmentId, scores]) => ({
      enrollmentId,
      scoreSer: scores.ser === '' ? null : Number(scores.ser),
      scoreSaber: scores.saber === '' ? null : Number(scores.saber),
      scoreHacer: scores.hacer === '' ? null : Number(scores.hacer),
      scoreAuto: scores.auto === '' ? null : Number(scores.auto),
      recoveryScore: scores.recovery === '' ? null : Number(scores.recovery),
      status: 'PUBLISHED',
    }))

    bulkSaveMutation.mutate({
      teacherAssignmentId: selectedAssignment,
      trimesterId: selectedTrimester,
      grades: payloadGrades,
    })
  }

  // 7. Preparación de Opciones para UI
  const formatTrimesterName = (name: string) =>
    name
      .replace('_', ' ')
      .replace('PRIMER', '1ER')
      .replace('SEGUNDO', '2DO')
      .replace('TERCER', '3ER')

  const trimestersOptions = (currentYear?.trimesters || []).map((t) => ({
    value: t.id,
    label: `${formatTrimesterName(t.name)} ${t.isOpen ? '🟢 (ABIERTO)' : '🔴 (CERRADO)'}`,
  }))

  const isCurrentTrimesterOpen =
    currentYear?.trimesters?.find((t) => t.id === selectedTrimester)?.isOpen ?? false

  const classroomsOptions = (classroomsData?.data || []).map((c) => ({
    value: c.id,
    label: `${c.grade} "${c.section}" - ${c.level}`,
  }))

  const assignmentsOptions = (assignmentsData?.data || []).map((a) => ({
    value: a.id,
    label: `${a.subject.name} - Prof. ${a.teacher.fullName.split(' ')[0]}`,
  }))

  return {
    hasAccess,
    canManageGrades,
    selectedTrimester,
    setSelectedTrimester,
    selectedClassroom,
    setSelectedClassroom,
    selectedAssignment,
    setSelectedAssignment,
    trimestersOptions,
    classroomsOptions,
    assignmentsOptions,
    isCurrentTrimesterOpen,
    studentsGrades,
    isGradesLoading,
    gradesDict,
    handleScoreChange,
    pendingRequests,
    handleBulkSave,
    isSaving: bulkSaveMutation.isPending,
  }
}
