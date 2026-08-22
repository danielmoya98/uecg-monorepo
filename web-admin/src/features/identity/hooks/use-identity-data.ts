import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AcademicYearsService } from '@/features/academic-years/api/academic-years.service'
import { ClassroomsService } from '@/features/classrooms/api/classrooms.service'
import { InstitutionsService } from '@/features/institutions/api/institutions.service'
import type { Option, Classroom, AcademicYear } from '../types/identity.types'

export const useIdentityData = (canManageIdentity: boolean) => {
  const [levelFilter, setLevelFilter] = useState<string>('')
  const [classroomFilter, setClassroomFilter] = useState<string>('')

  // 1. Obtener datos de la Institución y niveles permitidos
  const { data: institution } = useQuery({
    queryKey: ['currentInstitution'],
    queryFn: InstitutionsService.getCurrent,
  })
  const allowedLevels: string[] = institution?.levels || []

  // 2. Obtener el Año Académico actual
  const { data: currentYear } = useQuery<AcademicYear>({
    queryKey: ['currentAcademicYear'],
    queryFn: AcademicYearsService.getCurrent,
  })

  // 3. Obtener todas las aulas asignadas al año lectivo actual
  const { data: classroomsData } = useQuery({
    queryKey: ['classrooms', currentYear?.id],
    queryFn: () => ClassroomsService.getAll(1, 100, '', currentYear?.id),
    enabled: !!currentYear?.id && canManageIdentity,
  })

  const classrooms: Classroom[] = classroomsData?.data || []
  const availableClassrooms = classrooms.filter(
    (c) => levelFilter === '' || c.level === levelFilter
  )

  // 4. Formateo de opciones en base a tipado estricto
  const levelOptions: Option[] = [
    { value: '', label: 'TODA LA INSTITUCIÓN' },
    ...allowedLevels.map((lvl) => ({ value: lvl, label: `NIVEL ${lvl.toUpperCase()}` })),
  ]

  const classroomOptions: Option[] = [
    { value: '', label: 'TODOS LOS CURSOS' },
    ...availableClassrooms.map((c) => ({
      value: c.id,
      label: `${c.grade} "${c.section}" - ${c.shift.toUpperCase()}`,
    })),
  ]

  return {
    currentYear,
    levelFilter,
    setLevelFilter,
    classroomFilter,
    setClassroomFilter,
    levelOptions,
    classroomOptions,
  }
}
