import { api } from '@/shared/api/client'

export interface Permission {
  id: string
  action: string
  subject: string
  description: string
}

export interface RolePermissionRelation {
  permission: Permission
}

export interface Role {
  id: string
  name: string
  description: string | null
  permissions: RolePermissionRelation[]
  _count?: {
    users: number
  }
}

export interface CreateRolePayload {
  name: string
  description: string
}

export const RbacService = {
  /**
   * Obtiene la lista completa de roles registrados en el sistema.
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get('/roles')
    return response.data
  },

  /**
   * Obtiene el catálogo completo de todos los permisos disponibles en el sistema.
   */
  getPermissionsCatalog: async (): Promise<Permission[]> => {
    const response = await api.get('/roles/permissions-catalog')
    return response.data
  },

  /**
   * Actualiza el listado de permisos vinculados a un perfil específico.
   */
  updateRolePermissions: async (roleId: string, permissionIds: string[]): Promise<any> => {
    const response = await api.patch(`/roles/${roleId}/permissions`, { permissionIds })
    return response.data
  },

  /**
   * Registra un nuevo perfil en la base de datos de seguridad.
   */
  createRole: async (payload: CreateRolePayload): Promise<Role> => {
    const response = await api.post('/roles', payload)
    return response.data
  },

  /**
   * Elimina de forma definitiva un perfil de acceso del sistema.
   */
  deleteRole: async (roleId: string): Promise<any> => {
    const response = await api.delete(`/roles/${roleId}`)
    return response.data
  },
}
