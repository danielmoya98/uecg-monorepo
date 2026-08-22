import { useQuery } from '@tanstack/react-query'
import { AcademicYearsService } from '@/features/academic-years/api/academic-years.service'
import { InstitutionsService } from '@/features/institutions/api/institutions.service'
import { ClassroomsService } from '@/features/classrooms/api/classrooms.service'
import { UsersService } from '@/features/users/api/users.service'
import type { Classroom } from '@/features/classrooms/types/classrooms.types'

export const useAssignmentsData = (canManageAssignments: boolean) => {
  // 1. Obtener gestión escolar activa actualmente
  const { data: currentYear, isLoading: isLoadingYear } = useQuery({
    queryKey: ['currentAcademicYear'],
    queryFn: AcademicYearsService.getCurrent,
    staleTime: 5 * 60 * 1000,
  })

  const activeYearId = currentYear?.id

  // 2. Obtener configuración de la institución educativa para saber si está en modo FIXED_BASE
  const { data: institution, isLoading: isLoadingInst } = useQuery({
    queryKey: ['currentInstitution'],
    queryFn: InstitutionsService.getCurrent,
    staleTime: 5 * 60 * 1000,
  })

  const isFixedBaseMode = institution?.schedulingMode === 'FIXED_BASE'

  // 3. Obtener lista de aulas (classrooms)
  const { data: classroomsResult, isLoading: isLoadingClassrooms } = useQuery({
    queryKey: ['classrooms_list', activeYearId],
    queryFn: () => ClassroomsService.getAll(1, 100, undefined, activeYearId),
    enabled: !!activeYearId,
    staleTime: 30 * 1000,
  })

  const classrooms: Classroom[] = (() => {
    if (!classroomsResult) return []
    if (Array.isArray(classroomsResult)) return classroomsResult
    if (classroomsResult && Array.isArray(classroomsResult.data)) return classroomsResult.data
    return []
  })()

  // 4. Obtener lista de docentes (users con rol DOCENTE)
  const { data: usersResult, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['teachers_list'],
    queryFn: () => UsersService.getAll(1, 100, ''),
    enabled: canManageAssignments,
    staleTime: 5 * 60 * 1000,
  })

  const teachers = (() => {
    const list = (() => {
      if (!usersResult) return []
      if (Array.isArray(usersResult)) return usersResult
      if (usersResult && Array.isArray(usersResult.data)) return usersResult.data
      return []
    })()
    return list.filter((u: any) => u.role === 'DOCENTE')
  })()

  return {
    currentYear,
    isFixedBaseMode,
    classrooms,
    teachers,
    isLoading: isLoadingYear || isLoadingInst || (!!activeYearId && isLoadingClassrooms) || (canManageAssignments && isLoadingUsers),
  }
}
