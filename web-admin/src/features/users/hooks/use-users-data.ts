import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { UsersService } from '../api/users.service'
import type { User, CreateUserPayload, UpdateUserPayload } from '../types/users.types'

export type DrawerMode = 'create' | 'edit' | 'delete' | 'reset' | 'reactivate'

export const useUsersData = () => {
  const queryClient = useQueryClient()

  // 1. Estados de Filtros y Paginación
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [filterRole, setFilterRole] = useState('Todos')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  // 2. Estados del Cajón (Drawer)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Reiniciar paginación al cambiar filtros
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterRole])

  // 3. Obtención de Datos (React Query)
  const {
    data: result,
    isPending,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['users', page, debouncedSearch, filterRole],
    queryFn: () =>
      UsersService.getAll(
        page,
        10,
        debouncedSearch,
        filterRole !== 'Todos' ? filterRole : undefined
      ),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  })

  // Normalización defensiva de datos ante cualquier estructura de respuesta
  const displayUsers = (() => {
    let list: any[] = []
    if (Array.isArray(result)) {
      list = result
    } else if (result && Array.isArray(result.data)) {
      list = result.data
    }

    return list.map((u: any) => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      role: u.role,
      status: u.status === 'ACTIVE' ? ('Activo' as const) : ('Inactivo' as const),
    }))
  })()

  const meta = (() => {
    if (result && result.meta) {
      return result.meta
    }
    return {
      total: displayUsers.length,
      totalPages: Math.ceil(displayUsers.length / 10) || 1,
    }
  })()

  // 4. Mutaciones
  const createMutation = useMutation({
    mutationFn: (data: CreateUserPayload) => UsersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al crear el usuario'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      UsersService.update(id, data),
    onSuccess: () => {
      toast.success('PERFIL ACTUALIZADO EXITOSAMENTE')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      closeDrawer()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al actualizar perfil'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => UsersService.delete(id),
    onSuccess: () => {
      toast.success('USUARIO DESACTIVADO EXITOSAMENTE')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      closeDrawer()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al desactivar usuario'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => UsersService.reactivate(id),
    onSuccess: () => {
      toast.success('USUARIO REACTIVADO EXITOSAMENTE')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      closeDrawer()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al reactivar usuario'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => UsersService.resetPassword(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al restaurar clave'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  // Handlers para el Drawer
  const handleAction = (mode: DrawerMode, user: any = null) => {
    setDrawerMode(mode)
    if (user) {
      const list = Array.isArray(result) ? result : result?.data || []
      const originalUser = list.find((u: any) => u.id === user.id) || null
      setSelectedUser(originalUser)
    } else {
      setSelectedUser(null)
    }
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedUser(null)
  }

  return {
    // Paginación y Filtros
    page,
    setPage,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    viewMode,
    setViewMode,

    // Drawer y Selección
    isDrawerOpen,
    drawerMode,
    selectedUser,
    handleAction,
    closeDrawer,

    // Datos
    displayUsers,
    meta,
    isPending,
    isFetching,
    refetch,

    // Mutaciones
    createMutation,
    updateMutation,
    deleteMutation,
    reactivateMutation,
    resetPasswordMutation,
  }
}
