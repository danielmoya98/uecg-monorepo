import { useState, useRef, useEffect } from 'react'
import { ShieldCheck, MoreVertical, Settings2, Trash2 } from 'lucide-react'
import { SwissTableContainer, SwissEmptyState } from '@/shared/ui'
import type { Role } from '../api/rbac.service'
import type { RoleDrawerMode } from './role-drawer'

const PROTECTED_ROLES = ['SUPER_ADMIN', 'DIRECTOR', 'DOCENTE', 'PADRE', 'ESTUDIANTE']

interface RoleTableProps {
  roles: Role[]
  isPending?: boolean
  onAction: (mode: RoleDrawerMode, role: Role) => void
}

export const RoleTable = ({ roles, isPending = false, onAction }: RoleTableProps) => {
  return (
    <SwissTableContainer isPending={isPending}>
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-gray-50 border-b border-uecg-line">
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Identidad / Perfil
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Descripción Alcance
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line text-center w-28">
              Usuarios
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line text-center w-28">
              Permisos
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray text-center w-24">
              Operación
            </th>
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`role-sk-${i}`} className="border-b border-uecg-line animate-pulse">
                <td className="px-5 py-4 border-r border-uecg-line flex items-center gap-3.5">
                  <div className="w-8 h-8 bg-gray-200 shrink-0" />
                  <div className="h-4 w-32 bg-gray-200" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line">
                  <div className="h-3 w-56 bg-gray-100" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line text-center">
                  <div className="h-4 w-6 bg-gray-200 mx-auto" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line text-center">
                  <div className="h-4 w-6 bg-gray-200 mx-auto" />
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="h-4 w-4 bg-gray-200 mx-auto" />
                </td>
              </tr>
            ))
          ) : roles.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-0">
                <SwissEmptyState
                  title="Sin Roles Encontrados"
                  description="No se encontraron roles coincidentes en el sistema."
                />
              </td>
            </tr>
          ) : (

            roles.map((role, index) => (
              <RoleTableRow
                key={role.id}
                role={role}
                index={index}
                onAction={onAction}
              />
            ))
          )}
        </tbody>
      </table>
    </SwissTableContainer>
  )
}

interface RoleTableRowProps {
  role: Role
  index: number
  onAction: (mode: RoleDrawerMode, role: Role) => void
}

const RoleTableRow = ({ role, index, onAction }: RoleTableRowProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isProtected = PROTECTED_ROLES.includes(role.name)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <tr
      className="border-b border-uecg-line hover:bg-blue-50/20 transition-colors duration-150 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* 1. Perfil / Nombre */}
      <td className="px-5 py-3.5 border-r border-uecg-line">
        <div className="flex items-center gap-3.5">
          <div
            className="w-8 h-8 bg-uecg-dark text-white flex items-center justify-center font-black text-[10px] shadow-sm shrink-0"
            aria-hidden="true"
          >
            {role.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-black uppercase tracking-tight text-xs text-uecg-text">
            {role.name.replace(/_/g, ' ')}
          </span>
          {isProtected && (
            <span title="Perfil protegido por la semilla de seguridad">
              <ShieldCheck
                className="w-4 h-4 text-uecg-blue shrink-0"
                aria-label="Rol del sistema protegido"
              />
            </span>
          )}
        </div>
      </td>

      {/* 2. Descripción */}
      <td className="px-5 py-3.5 border-r border-uecg-line text-[10px] font-bold text-uecg-gray uppercase tracking-wide leading-relaxed">
        {role.description || 'Sin descripción establecida.'}
      </td>

      {/* 3. Cantidad Usuarios */}
      <td className="px-5 py-3.5 border-r border-uecg-line text-center font-black text-xs text-uecg-dark">
        {role._count?.users || 0}
      </td>

      {/* 4. Cantidad Permisos */}
      <td className="px-5 py-3.5 border-r border-uecg-line text-center font-black text-xs text-uecg-blue">
        {role.permissions?.length || 0}
      </td>

      {/* 5. Dropdown de Operaciones */}
      <td className="px-5 py-3.5 text-center">
        <div ref={menuRef} className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-uecg-gray hover:text-uecg-blue hover:bg-gray-100 p-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-uecg-blue"
            aria-haspopup="true"
            aria-expanded={isOpen}
            aria-label={`Acciones operativas para el rol ${role.name}`}
          >
            <MoreVertical className="w-4 h-4 mx-auto" />
          </button>

          {isOpen && (
            <div
              className="absolute right-0 mt-1 w-48 bg-white border border-uecg-line shadow-2xl z-20 flex flex-col text-left animate-in fade-in zoom-in-95 duration-150"
              role="menu"
              aria-label="Operaciones"
            >
              <div className="px-3.5 py-2 border-b border-uecg-line bg-gray-50">
                <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray">
                  Operaciones
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onAction('edit_permissions', role)
                }}
                className="flex items-center gap-2.5 px-3.5 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-uecg-blue hover:text-white transition-all text-uecg-dark cursor-pointer text-left focus:bg-uecg-blue focus:text-white outline-none"
                role="menuitem"
              >
                <Settings2 className="w-3.5 h-3.5" /> Matriz de Permisos
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onAction('delete', role)
                }}
                disabled={isProtected}
                className="flex items-center gap-2.5 px-3.5 py-3 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-all border-t border-uecg-line disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-red-600 disabled:cursor-not-allowed cursor-pointer text-left focus:bg-red-600 focus:text-white outline-none"
                role="menuitem"
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar Rol
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}
export default RoleTable
