import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { SubjectsService } from '../api/subjects.service'
import { InstitutionsService } from '@/features/institutions/api/institutions.service'
import type { Subject, SubjectPayload } from '../types/subjects.types'

export type DrawerMode = 'create' | 'edit' | 'delete'

export const useSubjectsData = () => {
  const queryClient = useQueryClient()

  // 1. Estados de Filtros y Paginación
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  // 2. Estados del Cajón (Drawer)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create')
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

  // Reiniciar paginación al cambiar filtros
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedLevel, selectedStatus])

  // 3. Obtención de Datos de la Institución (para niveles permitidos)
  const { data: institution } = useQuery({
    queryKey: ['currentInstitution'],
    queryFn: InstitutionsService.getCurrent,
    staleTime: 5 * 60 * 1000,
  })

  const allowedLevels: string[] = institution?.levels || []

  const isActiveFilter = (() => {
    if (selectedStatus === 'active') return true
    if (selectedStatus === 'inactive') return false
    return undefined
  })()

  // 4. Obtención de Materias (React Query)
  const {
    data: result,
    isPending,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['subjects', page, debouncedSearch, selectedLevel, selectedStatus],
    queryFn: () =>
      SubjectsService.getAll(
        page,
        10,
        debouncedSearch,
        selectedLevel || undefined,
        isActiveFilter
      ),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  })

  // Normalización defensiva de datos
  const displaySubjects: Subject[] = (() => {
    if (Array.isArray(result)) {
      return result
    } else if (result && Array.isArray(result.data)) {
      return result.data
    }
    return []
  })()

  const meta = (() => {
    if (result && result.meta) {
      return result.meta
    }
    return {
      total: displaySubjects.length,
      totalPages: Math.ceil(displaySubjects.length / 10) || 1,
      page: 1,
      limit: 10,
    }
  })()

  // 5. Mutaciones
  const createMutation = useMutation({
    mutationFn: (data: SubjectPayload) => SubjectsService.create(data),
    onSuccess: () => {
      toast.success('MATERIA CREADA EXITOSAMENTE')
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      closeDrawer()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al crear la materia'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubjectPayload> }) =>
      SubjectsService.update(id, data),
    onSuccess: () => {
      toast.success('MATERIA ACTUALIZADA EXITOSAMENTE')
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      closeDrawer()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al actualizar la materia'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive?: boolean }) =>
      SubjectsService.toggleStatus(id, isActive),
    onSuccess: (updated) => {
      toast.success(
        updated.isActive
          ? 'MATERIA ACTIVADA EN EL CATÁLOGO'
          : 'MATERIA DESACTIVADA DEL CATÁLOGO'
      )
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || 'Error al cambiar estado de la materia'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => SubjectsService.delete(id),
    onSuccess: () => {
      toast.success('MATERIA ELIMINADA EXITOSAMENTE')
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      closeDrawer()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'No se pudo eliminar la materia'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  // Handlers del Drawer
  const handleAction = (mode: DrawerMode, subject: Subject | null = null) => {
    setDrawerMode(mode)
    setSelectedSubject(subject)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedSubject(null)
  }

  return {
    // Filtros y Paginación
    page,
    setPage,
    searchTerm,
    setSearchTerm,
    selectedLevel,
    setSelectedLevel,
    selectedStatus,
    setSelectedStatus,
    viewMode,
    setViewMode,
    allowedLevels,

    // Drawer y Selección
    isDrawerOpen,
    drawerMode,
    selectedSubject,
    handleAction,
    closeDrawer,

    // Datos
    subjects: displaySubjects,
    meta,
    isPending,
    isFetching,
    refetch,

    // Mutaciones
    createMutation,
    updateMutation,
    toggleStatusMutation,
    deleteMutation,
  }
}

