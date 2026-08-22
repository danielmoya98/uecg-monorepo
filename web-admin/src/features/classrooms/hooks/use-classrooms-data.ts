import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { ClassroomsService } from '../api/classrooms.service'
import { AcademicYearsService } from '@/features/academic-years/api/academic-years.service'
import { InstitutionsService } from '@/features/institutions/api/institutions.service'
import type {
  Classroom,
  ClassroomPayload,
  BulkClassroomPayload,
} from '../types/classrooms.types'

export type ClassroomDrawerMode = 'create' | 'edit' | 'delete'

export const useClassroomsData = () => {
  const queryClient = useQueryClient()

  // 1. Estados de Filtros y Paginación
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedShift, setSelectedShift] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  // 2. Estados de Cajones (Drawers) y Selección
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<ClassroomDrawerMode>('create')
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [isBulkDrawerOpen, setIsBulkDrawerOpen] = useState(false)

  // 3. Consultas de Servidor
  // A. Obtener gestión escolar activa actualmente
  const { data: currentYear, isLoading: isLoadingYear } = useQuery({
    queryKey: ['currentAcademicYear'],
    queryFn: AcademicYearsService.getCurrent,
    staleTime: 5 * 60 * 1000,
  })

  const activeYearId = currentYear?.id

  // B. Obtener configuración de la institución educativa
  const { data: institution, isLoading: isLoadingInst } = useQuery({
    queryKey: ['currentInstitution'],
    queryFn: InstitutionsService.getCurrent,
    staleTime: 5 * 60 * 1000,
  })

  // Reiniciar paginación al cambiar filtros
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedLevel, selectedShift, activeYearId])

  // C. Obtener lista paginada de aulas
  const {
    data: result,
    isPending,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['classrooms', page, debouncedSearch, activeYearId, selectedLevel, selectedShift],
    queryFn: () =>
      ClassroomsService.getAll(
        page,
        10,
        debouncedSearch,
        activeYearId,
        selectedLevel || undefined,
        selectedShift || undefined
      ),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
    enabled: !!activeYearId,
  })

  // Normalización defensiva de datos ante cualquier estructura de respuesta
  const classrooms: Classroom[] = (() => {
    if (!result) return []
    if (Array.isArray(result)) return result
    if (result && Array.isArray(result.data)) return result.data
    return []
  })()

  const meta = (() => {
    if (result && result.meta) {
      return result.meta
    }
    return {
      total: classrooms.length,
      totalPages: Math.ceil(classrooms.length / 10) || 1,
    }
  })()

  // 4. Mutaciones con Invalidation Cache Seguro
  const createMutation = useMutation({
    mutationFn: (data: ClassroomPayload) => ClassroomsService.create(data),
    onSuccess: () => {
      toast.success('CURSO REGISTRADO CON ÉXITO')
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      closeDrawer()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al registrar el curso'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClassroomPayload> }) =>
      ClassroomsService.update(id, data),
    onSuccess: () => {
      toast.success('CURSO ACTUALIZADO CON ÉXITO')
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      closeDrawer()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al actualizar el curso'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ClassroomsService.delete(id),
    onSuccess: () => {
      toast.success('CURSO ELIMINADO CON ÉXITO')
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      closeDrawer()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al eliminar el curso'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  const bulkMutation = useMutation({
    mutationFn: (payload: BulkClassroomPayload) => ClassroomsService.createBulk(payload),
    onSuccess: (data) => {
      if (data.createdCount > 0) {
        toast.success(`Éxito: ${data.message}`)
      } else {
        toast.warning('No se creó ningún curso (es posible que ya existieran).')
      }
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      closeBulkDrawer()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al realizar la creación masiva'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  // 5. Gestores de Estados de Drawers
  const handleAction = (mode: ClassroomDrawerMode, classroom: Classroom | null = null) => {
    setDrawerMode(mode)
    setSelectedClassroom(classroom)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedClassroom(null)
  }

  const openBulkDrawer = () => {
    setIsBulkDrawerOpen(true)
  }

  const closeBulkDrawer = () => {
    setIsBulkDrawerOpen(false)
  }

  return {
    // Paginación y Filtros
    page,
    setPage,
    searchTerm,
    setSearchTerm,
    selectedLevel,
    setSelectedLevel,
    selectedShift,
    setSelectedShift,
    viewMode,
    setViewMode,

    // Cajones (Drawers)
    isDrawerOpen,
    drawerMode,
    selectedClassroom,
    handleAction,
    closeDrawer,
    isBulkDrawerOpen,
    openBulkDrawer,
    closeBulkDrawer,

    // Estados de Carga e Información
    currentYear,
    institution,
    classrooms,
    meta,
    isPending: isPending || isLoadingYear || isLoadingInst,
    isFetching,
    refetch,

    // Operaciones (Mutaciones)
    createMutation,
    updateMutation,
    deleteMutation,
    bulkMutation,
  }
}
