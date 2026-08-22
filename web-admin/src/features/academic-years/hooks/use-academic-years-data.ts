import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AcademicYearsService, type AcademicYearsResponse } from '@/features/academic-years/api/academic-years.service'
import { useDebounce } from '@/shared/hooks/use-debounce'
import type { AcademicYearPayload } from '../types/academic-years.types'

export const useAcademicYearsData = () => {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
    setPage(1)
  }

  // Consumimos el servicio de consulta
  const { data: queryResponse, isLoading: isLoadingData } = useQuery<AcademicYearsResponse>({
    queryKey: ['academicYears', page, debouncedSearch],
    queryFn: () => AcademicYearsService.getAll(page, 10, debouncedSearch),
    placeholderData: (previousData) => previousData,
  })

  // NORMALIZACIÓN EXTRACTORA: Nos defendemos de la envoltura raíz de NestJS
  // Si queryResponse tiene directamente la propiedad 'data' (JSON plano), la usamos.
  const years = Array.isArray(queryResponse?.data)
    ? queryResponse.data
    : (Array.isArray(queryResponse) ? queryResponse : [])

  const meta = queryResponse?.meta || { total: years.length, totalPages: 1 }

  // Mutación para el cambio de estados (ACTIVE, CLOSED)
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'CLOSED' }) =>
      AcademicYearsService.update(id, { status }),
    onSuccess: (_, variables) => {
      toast.success(`GESTIÓN ${variables.status === 'ACTIVE' ? 'ACTIVADA' : 'CERRADA'} EXITOSAMENTE`)
      queryClient.invalidateQueries({ queryKey: ['academicYears'] })
      queryClient.invalidateQueries({ queryKey: ['currentAcademicYear'] })
      queryClient.invalidateQueries({ queryKey: ['academicYears_topnav'] })
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } }
      const msg = err.response?.data?.message || 'Error al actualizar estado'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  // Mutación para guardar (crear/editar)
  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: AcademicYearPayload }) => {
      if (id) return AcademicYearsService.update(id, payload)
      return AcademicYearsService.create(payload)
    },
    onSuccess: (_, variables) => {
      toast.success(variables.id ? 'GESTIÓN ACTUALIZADA' : 'GESTIÓN CREADA')
      queryClient.invalidateQueries({ queryKey: ['academicYears'] })
      queryClient.invalidateQueries({ queryKey: ['currentAcademicYear'] })
      queryClient.invalidateQueries({ queryKey: ['academicYears_topnav'] })
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } }
      const msg = err.response?.data?.message || 'Ocurrió un error en el servidor'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => AcademicYearsService.delete(id),
    onSuccess: () => {
      toast.success('GESTIÓN ELIMINADA')
      queryClient.invalidateQueries({ queryKey: ['academicYears'] })
      queryClient.invalidateQueries({ queryKey: ['currentAcademicYear'] })
      queryClient.invalidateQueries({ queryKey: ['academicYears_topnav'] })
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } }
      const msg = err.response?.data?.message || 'No se pudo eliminar'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  return {
    page,
    setPage,
    searchTerm,
    setSearchTerm: handleSearchChange,
    years,
    meta,
    isLoadingData,
    updateStatus: statusMutation.mutate,
    isUpdatingStatus: statusMutation.isPending,
    updatingId: statusMutation.variables?.id,
    saveAcademicYear: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    deleteAcademicYear: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}
