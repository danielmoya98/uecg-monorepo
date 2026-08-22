import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { RbacService } from '../api/rbac.service'
import type { Role, Permission } from '../api/rbac.service'
import { PERMISSIONS_DICT } from '../utils/permissions-dictionary'

export interface UIPermission {
  id: string
  rawKey: string
  name: string
  desc: string
}

export const useRbacMatrix = () => {
  const queryClient = useQueryClient()
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [localPermissions, setLocalPermissions] = useState<Set<string>>(new Set())

  // 1. Consultar roles y catálogo de permisos globales
  const { data: rawRoles, isLoading: loadingRoles } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: RbacService.getRoles,
  })

  const { data: rawCatalog, isLoading: loadingCatalog } = useQuery<Permission[]>({
    queryKey: ['permissions-catalog'],
    queryFn: RbacService.getPermissionsCatalog,
  })

  const roles = Array.isArray(rawRoles) ? rawRoles : []
  const catalog = Array.isArray(rawCatalog) ? rawCatalog : []

  // 2. Agrupación y traducción amigable utilizando el diccionario
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, UIPermission[]> = {}

    catalog.forEach((p) => {
      const rawKey = `${p.action}:${p.subject}`

      // Excluimos 'manage:all:all' si es redundante, o mantenemos catalog completo
      if (rawKey === 'manage:all:all') return

      const uiData = PERMISSIONS_DICT[rawKey] || {
        module: `⚙️ MÓDULO TÉCNICO: ${p.subject.toUpperCase()}`,
        name: `Acción: ${p.action.toUpperCase()}`,
        desc: p.description || 'Permiso nuevo sin traducción.',
      }

      if (!groups[uiData.module]) {
        groups[uiData.module] = []
      }

      groups[uiData.module].push({
        id: p.id,
        rawKey,
        name: uiData.name,
        desc: uiData.desc,
      })
    })

    // Ordenar alfabéticamente los nombres de módulos
    return Object.keys(groups)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = groups[key]
          return acc
        },
        {} as Record<string, UIPermission[]>
      )
  }, [catalog])

  // 3. Sincronizar el checklist local al cambiar de rol seleccionado
  useEffect(() => {
    if (roles.length === 0) return

    if (selectedRoleId) {
      const activeRole = roles.find((r) => r.id === selectedRoleId)
      if (activeRole) {
        const activePermIds = activeRole.permissions.map((p) => p.permission.id)
        
        // Comparación simple de conjuntos para evitar re-render bucle si el conjunto es idéntico
        const isSame = 
          activePermIds.length === localPermissions.size && 
          activePermIds.every((id) => localPermissions.has(id))

        if (!isSame) {
          setLocalPermissions(new Set(activePermIds))
        }
      }
    } else {
      if (localPermissions.size > 0) {
        setLocalPermissions(new Set())
      }
    }
  }, [selectedRoleId, roles])

  // 4. Mutación para grabar la matriz en el servidor
  const saveMutation = useMutation({
    mutationFn: () => {
      if (!selectedRoleId) throw new Error('No se ha seleccionado ningún perfil.')
      return RbacService.updateRolePermissions(selectedRoleId, Array.from(localPermissions))
    },
    onSuccess: () => {
      toast.success('MATRIZ DE ACCESO ACTUALIZADA Y COMPILADA CON ÉXITO')
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      
      // Detonamos aviso para re-renders de enrutador en vivo
      window.dispatchEvent(new Event('storage-update'))
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al guardar los permisos de la matriz'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  // 5. Manejador interactivo de checkboxes
  const togglePermission = (permissionId: string) => {
    setLocalPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(permissionId)) {
        next.delete(permissionId)
      } else {
        next.add(permissionId)
      }
      return next
    })
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || null

  return {
    // Datos y Cargas
    roles,
    catalog,
    isLoading: loadingRoles || loadingCatalog,
    selectedRoleId,
    setSelectedRoleId,
    selectedRole,
    localPermissions,

    // Datos Procesados
    groupedPermissions,

    // Acciones y Mutaciones
    togglePermission,
    saveMatrix: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  }
}
