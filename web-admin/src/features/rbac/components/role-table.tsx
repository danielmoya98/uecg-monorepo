import { useState, useRef, useEffect } from 'react'
import { ShieldCheck, MoreVertical, Settings2, Trash2 } from 'lucide-react'
import { SwissTableContainer, SwissEmptyState } from '@/shared/ui'
import type { Role } from '../api/rbac.service'
import type { RoleDrawerMode } from './role-drawer'

const PROTECTED_ROLES = ['SUPER_ADMIN', 'DIRECTOR', 'DOCENTE', 'PADRE', 'ESTUDIANTE']

interface RoleTableProps {
  roles: Role[]
  onAction: (mode: RoleDrawerMode, role: Role) => void
}

export const RoleTable = ({ roles, onAction }: RoleTableProps) => {
  return (
    <SwissTableContainer>
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-uecg-line dark:border-zinc-800">
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">
              Identidad / Perfil
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">
              Descripción Alcance
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 text-center w-28">
              Usuarios
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 text-center w-28">
              Permisos
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 text-center w-24">
              Operación
            </th>
          </tr>
        </thead>
        <tbody>
          {roles.length === 0 ? (
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
      className="border-b border-uecg-line dark:border-zinc-800 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors duration-150 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* 1. Perfil / Nombre */}
      <td className="px-5 py-3.5 border-r border-uecg-line dark:border-zinc-800">
        <div className="flex items-center gap-3.5">
          <div
            className="w-8 h-8 bg-uecg-dark dark:bg-zinc-800 text-white flex items-center justify-center font-black text-[10px] shadow-sm shrink-0"
            aria-hidden="true"
          >
            {role.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-black uppercase tracking-tight text-xs text-uecg-text dark:text-zinc-100">
            {role.name.replace(/_/g, ' ')}
          </span>
          {isProtected && (
            <span title="Perfil protegido por la semilla de seguridad">
              <ShieldCheck
                className="w-4 h-4 text-uecg-blue dark:text-blue-400 shrink-0"
                aria-label="Rol del sistema protegido"
              />
            </span>
          )}
        </div>
      </td>

      {/* 2. Descripción */}
      <td className="px-5 py-3.5 border-r border-uecg-line dark:border-zinc-800 text-[10px] font-bold text-uecg-gray dark:text-zinc-400 uppercase tracking-wide leading-relaxed">
        {role.description || 'Sin descripción establecida.'}
      </td>

      {/* 3. Cantidad Usuarios */}
      <td className="px-5 py-3.5 border-r border-uecg-line dark:border-zinc-800 text-center font-black text-xs text-uecg-dark dark:text-zinc-200">
        {role._count?.users || 0}
      </td>

      {/* 4. Cantidad Permisos */}
      <td className="px-5 py-3.5 border-r border-uecg-line dark:border-zinc-800 text-center font-black text-xs text-uecg-blue dark:text-blue-400">
        {role.permissions?.length || 0}
      </td>

      {/* 5. Dropdown de Operaciones */}
      <td className="px-5 py-3.5 text-center">
        <div ref={menuRef} className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-uecg-gray dark:text-zinc-400 hover:text-uecg-blue dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 p-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-uecg-blue"
            aria-haspopup="true"
            aria-expanded={isOpen}
            aria-label={`Acciones operativas para el rol ${role.name}`}
          >
            <MoreVertical className="w-4 h-4 mx-auto" />
          </button>

          {isOpen && (
            <div
              className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#121214] border border-uecg-line dark:border-zinc-800 shadow-2xl z-20 flex flex-col text-left animate-in fade-in zoom-in-95 duration-150"
              role="menu"
              aria-label="Operaciones"
            >
              <div className="px-3.5 py-2 border-b border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400">
                  Operaciones
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onAction('edit_permissions', role)
                }}
                className="flex items-center gap-2.5 px-3.5 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-uecg-blue hover:text-white transition-all text-uecg-dark dark:text-zinc-200 cursor-pointer text-left focus:bg-uecg-blue focus:text-white outline-none"
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
                className="flex items-center gap-2.5 px-3.5 py-3 text-[9px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all border-t border-uecg-line dark:border-zinc-800 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-red-600 disabled:cursor-not-allowed cursor-pointer text-left focus:bg-red-600 focus:text-white outline-none"
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
