import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit, Key, Trash2, UserCheck } from 'lucide-react'
import { SwissTableContainer, SwissEmptyState } from '@/shared/ui'
import type { DisplayUser } from './users-grid'
import type { DrawerMode } from '../hooks/use-users-data'

interface UsersTableProps {
  users: DisplayUser[]
  isPending: boolean
  isFetching: boolean
  onAction: (action: DrawerMode, user: DisplayUser) => void
}

export default function UsersTable({ users, isPending, isFetching, onAction }: UsersTableProps) {
  return (
    <SwissTableContainer isFetching={isFetching} isPending={isPending}>
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-uecg-line dark:border-zinc-800">
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">
              Nombre / Usuario
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">
              Correo Institucional
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 w-40 text-center">
              Rol
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 w-36 text-center">
              Estado
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 text-center w-24">
              Operación
            </th>
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-user-${i}`} className="border-b border-uecg-line dark:border-zinc-800 animate-pulse">
                <td className="px-5 py-4 border-r border-uecg-line dark:border-zinc-800 flex items-center gap-3.5">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-800 shrink-0" />
                  <div className="h-3 w-40 bg-gray-200 dark:bg-zinc-800" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-3 w-48 bg-gray-200 dark:bg-zinc-800" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-5 w-20 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                </td>
              </tr>
            ))
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-0">
                <SwissEmptyState
                  title="Sin coincidencias"
                  description="No se hallaron usuarios para los filtros seleccionados."
                />
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <UsersTableRow
                key={user.id}
                user={user}
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

interface UsersTableRowProps {
  user: DisplayUser
  index: number
  onAction: (action: DrawerMode, user: DisplayUser) => void
}

function UsersTableRow({ user, index, onAction }: UsersTableRowProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isActive = user.status === 'Activo'

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const getAvatarBg = (role: string, status: string) => {
    if (status === 'Inactivo') return 'bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400'
    if (['SUPER_ADMIN', 'DIRECTOR', 'ADMIN'].includes(role)) return 'bg-uecg-dark text-white'
    if (role === 'PADRE') return 'bg-yellow-500 text-white'
    return 'bg-uecg-blue text-white'
  }

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
      className={`border-b border-uecg-line dark:border-zinc-800 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors duration-150 animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
        !isActive ? 'bg-red-50/10 dark:bg-red-950/10 opacity-90' : ''
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* 1. Nombre / Avatar */}
      <td className="px-5 py-3.5 border-r border-uecg-line dark:border-zinc-800">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-8 h-8 flex items-center justify-center font-black text-[10px] shadow-sm shrink-0 ${getAvatarBg(
              user.role,
              user.status
            )}`}
            aria-hidden="true"
          >
            {getInitials(user.name)}
          </div>
          <span
            className={`font-black uppercase tracking-tight text-xs ${
              isActive ? 'text-uecg-text dark:text-zinc-100' : 'text-uecg-gray dark:text-zinc-400 line-through'
            }`}
          >
            {user.name}
          </span>
        </div>
      </td>

      {/* 2. Correo */}
      <td
        className={`px-5 py-3.5 border-r border-uecg-line dark:border-zinc-800 text-[11px] font-mono tracking-wide ${
          isActive ? 'text-uecg-text dark:text-zinc-300' : 'text-gray-400 dark:text-zinc-500'
        }`}
      >
        {user.email}
      </td>

      {/* 3. Rol */}
      <td className="px-5 py-3.5 border-r border-uecg-line dark:border-zinc-800 text-center">
        <span
          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border inline-block ${
            isActive
              ? ['SUPER_ADMIN', 'DIRECTOR', 'ADMIN'].includes(user.role)
                ? 'bg-uecg-dark text-white border-uecg-dark dark:bg-zinc-800 dark:border-zinc-700'
                : user.role === 'PADRE'
                ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/40'
                : 'bg-blue-50 dark:bg-blue-950/20 text-uecg-blue dark:text-blue-400 border-blue-100 dark:border-blue-900/40'
              : 'bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-300 dark:border-zinc-700'
          }`}
        >
          {user.role}
        </span>
      </td>

      {/* 4. Estado */}
      <td className="px-5 py-3.5 border-r border-uecg-line dark:border-zinc-800 text-center">
        <span
          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border inline-block ${
            isActive
              ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/40'
              : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40'
          }`}
        >
          {user.status}
        </span>
      </td>

      {/* 5. Acciones */}
      <td className="px-5 py-3.5 text-center">
        <div ref={menuRef} className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-uecg-gray dark:text-zinc-400 hover:text-uecg-blue dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 p-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-uecg-blue"
            aria-haspopup="true"
            aria-expanded={isOpen}
            aria-label={`Acciones operativas para el usuario ${user.name}`}
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

              {isActive ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      onAction('edit', user)
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-uecg-blue hover:text-white transition-all text-uecg-dark dark:text-zinc-100 cursor-pointer text-left focus:bg-uecg-blue focus:text-white outline-none"
                    role="menuitem"
                  >
                    <Edit className="w-3.5 h-3.5" /> Editar Perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      onAction('reset', user)
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-white transition-all text-uecg-dark dark:text-zinc-100 border-t border-uecg-line dark:border-zinc-800 cursor-pointer text-left focus:bg-yellow-500 focus:text-white outline-none"
                    role="menuitem"
                  >
                    <Key className="w-3.5 h-3.5" /> Restaurar Clave
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      onAction('delete', user)
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-3 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-all border-t border-uecg-line dark:border-zinc-800 cursor-pointer text-left focus:bg-red-600 focus:text-white outline-none"
                    role="menuitem"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Desactivar Usuario
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onAction('reactivate', user)
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-3 text-[9px] font-black uppercase tracking-widest text-green-700 dark:text-green-400 hover:bg-green-600 hover:text-white transition-all cursor-pointer text-left focus:bg-green-600 focus:text-white outline-none"
                  role="menuitem"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Reactivar Usuario
                </button>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}
