import { useState, useEffect, useMemo } from 'react'
import { ShieldAlert, Save, AlertTriangle, Users, Check, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { DrawerShell } from '@/shared/ui/drawer-shell'


import { RbacService } from '../api/rbac.service'
import type { Role, Permission } from '../api/rbac.service'
import { PERMISSIONS_DICT } from '../utils/permissions-dictionary'

export type RoleDrawerMode = 'create' | 'edit_permissions' | 'delete'

interface RoleDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  mode: RoleDrawerMode
  roleData: Role | null
}

interface UIPermission {
  id: string
  rawKey: string
  name: string
  desc: string
}

// 1. Esquema estricto de validación Zod para la creación de Roles
const roleSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(25, 'El nombre no puede exceder 25 caracteres.')
    .regex(/^[A-Za-zñÑáéíóúÁÉÍÓÚ_ ]+$/, 'Solo se permiten letras, espacios y guiones bajos.'),
  description: z
    .string()
    .min(5, 'La descripción debe detallar el alcance (mínimo 5 caracteres).')
    .max(150, 'La descripción no puede exceder 150 caracteres.'),
})

type RoleFormValues = z.infer<typeof roleSchema>

export default function RoleDrawer({
  isOpen,
  onClose,
  onSuccess,
  mode,
  roleData,
}: RoleDrawerProps) {
  const queryClient = useQueryClient()
  const [localPermissions, setLocalPermissions] = useState<Set<string>>(new Set())

  // 2. Formulario reactivo con React Hook Form + Resolver Zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  // 3. Obtener catálogo total de permisos si estamos en edición
  const { data: catalog } = useQuery<Permission[]>({
    queryKey: ['permissions-catalog'],
    queryFn: RbacService.getPermissionsCatalog,
    enabled: isOpen && mode === 'edit_permissions',
  })

  // 4. Resetear estados al abrir/cerrar o cambiar de rol
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit_permissions' && roleData) {
        const activePermIds = roleData.permissions?.map((p) => p.permission.id) || []
        setLocalPermissions(new Set(activePermIds))
      } else if (mode === 'create') {
        reset({
          name: '',
          description: '',
        })
      }
    }
  }, [isOpen, roleData, mode, reset])

  // Cerrar Drawer mediante tecla ESC (Accesibilidad de portales)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // 5. Agrupación y traducción visual coherente de los permisos del catálogo
  const groupedPermissions = useMemo(() => {
    if (!catalog || !Array.isArray(catalog)) return {}

    const groups: Record<string, UIPermission[]> = {}

    catalog.forEach((p) => {
      const rawKey = `${p.action}:${p.subject}`

      // Excluimos 'manage:all:all' por ser el comodín exclusivo del root
      if (rawKey === 'manage:all:all') return

      const uiData = PERMISSIONS_DICT[rawKey] || {
        module: `⚙️ MÓDULO TÉCNICO: ${p.subject.toUpperCase()}`,
        name: `Acción: ${p.action.toUpperCase()}`,
        desc: p.description || 'Habilidad del sistema sin traducción visual.',
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
  }

  // 6. Mutación del Drawer
  const actionMutation = useMutation({
    mutationFn: async (formData?: RoleFormValues) => {
      if (mode === 'create' && formData) {
        // Normalizamos el código del rol: Mayúsculas y con guiones bajos en vez de espacios
        const normalizedName = formData.name.trim().toUpperCase().replace(/ /g, '_')
        await RbacService.createRole({
          name: normalizedName,
          description: formData.description.trim(),
        })
        return 'Política de acceso creada de forma exitosa.'
      } else if (mode === 'edit_permissions' && roleData) {
        await RbacService.updateRolePermissions(roleData.id, Array.from(localPermissions))
        return 'Matriz de seguridad de perfiles actualizada.'
      } else if (mode === 'delete' && roleData) {
        await RbacService.deleteRole(roleData.id)
        return 'Política de acceso y perfil eliminados.'
      }
      throw new Error('Operación no permitida o datos incompletos.')
    },
    onSuccess: (message) => {
      toast.success(message)
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      
      // Detonamos refresco para re-renders de enrutador en vivo si alteramos permisos
      if (mode === 'edit_permissions') {
        window.dispatchEvent(new Event('storage-update'))
      }
      
      onSuccess()
      onClose()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al procesar la operación'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  const isSubmitting = actionMutation.isPending
  const userCount = roleData?._count?.users || 0

  const handleFormSubmit = (data: RoleFormValues) => {
    actionMutation.mutate(data)
  }

  const renderContent = () => {
    if (mode === 'create') {
      return (
        <form
          id="create-role-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-6 p-6"
        >
          <div>
            <label
              htmlFor="role-name-input"
              className="text-[10px] font-black uppercase tracking-widest text-uecg-dark mb-1.5 block"
            >
              Nombre del Perfil
            </label>
            <input
              id="role-name-input"
              type="text"
              placeholder="EJ. PSICOLOGO"
              {...register('name')}
              className={`w-full border bg-white px-3.5 py-3 text-uecg-dark font-bold uppercase text-[11px] focus:outline-none focus:ring-1 focus:ring-uecg-blue transition-colors shadow-sm ${
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-uecg-line focus:border-uecg-blue'
              }`}
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'role-name-error' : undefined}
            />
            {errors.name && (
              <span
                id="role-name-error"
                className="text-[9px] text-red-600 font-bold uppercase tracking-wider mt-1.5 block"
              >
                {errors.name.message}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="role-desc-input"
              className="text-[10px] font-black uppercase tracking-widest text-uecg-dark mb-1.5 block"
            >
              Descripción Alcance
            </label>
            <textarea
              id="role-desc-input"
              rows={4}
              placeholder="Describe el alcance de las responsabilidades de este rol..."
              {...register('description')}
              className={`w-full border bg-white px-3.5 py-3 text-uecg-text text-[11px] focus:outline-none focus:ring-1 focus:ring-uecg-blue transition-colors shadow-sm resize-none ${
                errors.description ? 'border-red-500 focus:border-red-500' : 'border-uecg-line focus:border-uecg-blue'
              }`}
              disabled={isSubmitting}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'role-desc-error' : undefined}
            />
            {errors.description && (
              <span
                id="role-desc-error"
                className="text-[9px] text-red-600 font-bold uppercase tracking-wider mt-1.5 block"
              >
                {errors.description.message}
              </span>
            )}
          </div>
        </form>
      )
    }

    if (mode === 'delete') {
      return (
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mb-5 animate-bounce">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-uecg-dark mb-3">
            ¿Eliminar el Rol {roleData?.name.replace(/_/g, ' ')}?
          </h3>

          {userCount > 0 ? (
            <div
              className="mt-4 border-2 border-yellow-300 bg-yellow-50/50 p-5 text-left w-full shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
              role="alert"
            >
              <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-800 flex items-center gap-2 mb-2.5">
                <Users className="w-4 h-4" /> Operación Bloqueada
              </h4>
              <p className="text-[11px] text-yellow-900 font-medium leading-relaxed uppercase tracking-wide">
                Este perfil de acceso está asignado actualmente a{' '}
                <span className="font-black bg-yellow-200 px-1.5 py-0.5 rounded-sm">
                  {userCount} usuarios
                </span>
                . Debes reasignar a estas personas a otro rol antes de poder purgar esta política de seguridad.
              </p>
            </div>
          ) : (
            <p className="text-xs text-uecg-gray font-medium uppercase tracking-wide mt-2 leading-relaxed">
              Esta acción es irreversible y purgará los privilegios del rol en la base de datos. Ningún usuario
              se verá afectado debido a que el rol está vacío.
            </p>
          )}
        </div>
      )
    }

    if (mode === 'edit_permissions') {
      return (
        <div className="p-6 flex flex-col gap-6">
          <div className="bg-gray-50 border border-uecg-line p-4.5 shadow-sm flex justify-between items-center">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray">
                Perfil Auditado
              </span>
              <h3 className="text-lg font-black uppercase tracking-tighter text-uecg-dark mt-0.5">
                {roleData?.name.replace(/_/g, ' ')}
              </h3>
            </div>
            <ShieldAlert className="w-7 h-7 text-uecg-blue opacity-50 shrink-0" />
          </div>

          <div className="flex flex-col gap-5">
            {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
              <fieldset
                key={moduleName}
                className="border border-uecg-line bg-white shadow-sm overflow-hidden"
              >
                <legend className="sr-only">{moduleName}</legend>
                <h4 className="text-[10px] font-black uppercase tracking-widest bg-gray-50 border-b border-uecg-line p-3.5 text-uecg-dark">
                  {moduleName}
                </h4>
                <div className="flex flex-col">
                  {perms.map((p, index) => {
                    const isChecked = localPermissions.has(p.id)
                    return (
                      <label
                        key={p.id}
                        className={`flex items-start gap-4 cursor-pointer group p-4.5 transition-colors duration-150 hover:bg-blue-50/20 focus-within:bg-blue-50/30 ${
                          index !== perms.length - 1 ? 'border-b border-uecg-line' : ''
                        }`}
                      >
                        <div className="pt-0.5">
                          {/* Checkbox Suizo Accesible por Teclado */}
                          <div
                            className={`w-4 h-4 border flex items-center justify-center transition-all duration-150 shadow-sm ${
                              isChecked
                                ? 'bg-uecg-blue border-uecg-blue text-white scale-105'
                                : 'bg-white border-gray-300 group-hover:border-uecg-blue'
                            } group-focus-within:ring-2 group-focus-within:ring-uecg-blue group-focus-within:ring-offset-1`}
                          >
                            {isChecked && (
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                          {/* Input nativo enfocado de forma oculta en el DOM */}
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isChecked}
                            onChange={() => togglePermission(p.id)}
                            aria-label={`Conceder habilidad ${p.name}`}
                          />
                        </div>
                        <div className="flex flex-col select-none">
                          <span
                            className={`text-[11px] font-black uppercase tracking-tight leading-none mb-1 ${
                              isChecked ? 'text-uecg-blue' : 'text-uecg-dark'
                            }`}
                          >
                            {p.name}
                          </span>
                          <span className="text-[9px] font-bold text-uecg-gray uppercase tracking-wider leading-relaxed">
                            {p.desc}
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </div>
      )
    }
  }

  const title =
    mode === 'create'
      ? 'Definir Rol'
      : mode === 'delete'
      ? 'Auditoría de Rol'
      : 'Matriz de Permisos'

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      kicker="Políticas de Acceso"
      icon={mode === 'delete' ? '!' : <ShieldCheck className="w-5 h-5 text-white" />}
      headerVariant={mode === 'delete' ? 'danger' : 'default'}
      isSubmitting={isSubmitting}
      maxWidth="max-w-[500px]"
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="overflow-y-auto flex-1 custom-scrollbar bg-white" tabIndex={0}>
          {renderContent()}
        </div>

        {/* Pie de Página / Acciones */}
        <div className="p-5 border-t border-uecg-line bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray hover:text-uecg-dark hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer outline-none focus:ring-2 focus:ring-uecg-gray"
          >
            Cancelar
          </button>

          {mode !== 'delete' || (mode === 'delete' && userCount === 0) ? (
            <button
              type={mode === 'create' ? 'submit' : 'button'}
              form={mode === 'create' ? 'create-role-form' : undefined}
              onClick={mode !== 'create' ? () => actionMutation.mutate(undefined) : undefined}
              disabled={isSubmitting}
              className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.15)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.35)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer outline-none focus:ring-2
                ${
                  mode === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
                    : 'bg-uecg-blue hover:bg-uecg-dark focus:ring-uecg-blue'
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Procesando...
                </span>
              ) : (
                <>
                  {mode === 'delete' ? (
                    <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5px]" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {mode === 'delete' ? 'Confirmar Eliminación' : 'Guardar Cambios'}
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </DrawerShell>
  )
}

