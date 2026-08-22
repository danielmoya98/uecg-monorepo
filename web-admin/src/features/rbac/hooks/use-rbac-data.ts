import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { RbacService } from '../api/rbac.service'
import type { Role } from '../api/rbac.service'
import type { RoleDrawerMode } from '../components/role-drawer'

export const useRbacData = () => {
  const queryClient = useQueryClient()

  // 1. Estado visual y filtros locales
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [searchTerm, setSearchTerm] = useState('')

  // 2. Control de estado efímero del Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<RoleDrawerMode>('create')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  // 3. Consulta de perfiles al servidor
  const { data: rawRoles, isLoading, refetch } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: RbacService.getRoles,
  })

  // Normalización extractora defensiva: Garantizamos que sea un array puro de roles
  const roles = Array.isArray(rawRoles) ? rawRoles : []

  // 4. Mutación para eliminación de perfil
  const deleteMutation = useMutation({
    mutationFn: (roleId: string) => RbacService.deleteRole(roleId),
    onSuccess: () => {
      toast.success('POLÍTICA DE ACCESO ELIMINADA EXITOSAMENTE')
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al eliminar el rol'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  // 5. Manejadores de acción interactivos
  const handleAction = (mode: RoleDrawerMode, role: Role | null = null) => {
    setDrawerMode(mode)
    setSelectedRole(role)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedRole(null)
  }

  return {
    // Listado y Estados de Carga
    roles,
    isLoading,
    refetch,

    // Filtros de UI
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,

    // Drawer y Modos de Edición
    isDrawerOpen,
    drawerMode,
    selectedRole,
    handleAction,
    closeDrawer,

    // Mutación de Eliminación Directa (por si se llama fuera de Drawer)
    deleteRole: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}
