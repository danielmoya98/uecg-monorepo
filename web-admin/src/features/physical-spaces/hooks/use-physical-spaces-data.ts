import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { PhysicalSpacesService } from '../api/physical-spaces.service'
import type { PhysicalSpace } from '../types/physical-spaces.types'

export const usePhysicalSpacesData = () => {
  const queryClient = useQueryClient()

  // 1. Estados de Filtros y Búsqueda
  const [selectedType, setSelectedType] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const debouncedSearch = useDebounce(searchTerm, 500)

  // 2. Consulta de Servidor
  const { data: spacesResult, isPending } = useQuery({
    queryKey: ['physicalSpaces', debouncedSearch, selectedType],
    queryFn: () =>
      PhysicalSpacesService.getAll(
        debouncedSearch || undefined,
        undefined, // Se listan activos e inactivos en el panel administrativo
        selectedType || undefined
      ),
    staleTime: 30 * 1000,
  })

  // Normalización defensiva de datos
  const spaces: PhysicalSpace[] = Array.isArray(spacesResult) ? spacesResult : []

  // 3. Mutación de borrado
  const deleteMutation = useMutation({
    mutationFn: (id: string) => PhysicalSpacesService.delete(id),
    onSuccess: () => {
      toast.success('ESPACIO ELIMINADO CON ÉXITO')
      queryClient.invalidateQueries({ queryKey: ['physicalSpaces'] })
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al eliminar el espacio físico'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  return {
    // Filtros y Búsqueda
    selectedType,
    setSelectedType,
    searchTerm,
    setSearchTerm,

    // Datos del servidor
    spaces,
    isPending,

    // Acciones de mutación
    deleteSpace: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
