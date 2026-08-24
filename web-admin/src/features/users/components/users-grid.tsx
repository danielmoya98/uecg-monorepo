import { ArrowRight, ShieldAlert, Key, Trash2, UserCheck } from 'lucide-react'
import { SwissEmptyState } from '@/shared/ui'
import type { DrawerMode } from '../hooks/use-users-data'

export interface DisplayUser {
  id: string
  name: string
  email: string
  role: string
  status: 'Activo' | 'Inactivo'
}

interface UsersGridProps {
  users: DisplayUser[]
  isPending: boolean
  isFetching: boolean
  onAction: (action: DrawerMode, user: DisplayUser) => void
}

export default function UsersGrid({ users, isPending, isFetching, onAction }: UsersGridProps) {
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

  return (
    <div
      className={`transition-opacity duration-200 pb-16 ${
        isFetching && !isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'
      }`}
    >
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-user-grid-${i}`}
              className="border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] h-[200px] animate-pulse"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm">
          <SwissEmptyState
            title="Sin coincidencias"
            description="No se hallaron usuarios en el servidor para los filtros actuales."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {users.map((user) => {
            const isActive = user.status === 'Activo'

            return (
              <div
                key={user.id}
                className={`group flex flex-col text-left border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] h-[200px] relative overflow-hidden transition-all duration-300 ${
                  isActive ? 'hover:border-uecg-blue dark:hover:border-blue-500 hover:shadow-lg' : 'opacity-80 bg-red-50/20 dark:bg-red-950/20'
                }`}
              >
                {/* Fondo Geométrico */}
                {isActive && (
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-uecg-blue/5 dark:bg-blue-500/10 rounded-none rotate-45 pointer-events-none group-hover:scale-150 group-hover:bg-uecg-blue/10 dark:group-hover:bg-blue-500/20 transition-transform duration-500" />
                )}

                {/* Área Principal de Información */}
                <div className="p-5 flex-1 w-full relative z-10 flex flex-col">
                  <div className="flex justify-between items-start w-full mb-3">
                    <div
                      className={`w-10 h-10 flex items-center justify-center font-black text-lg shadow-sm shrink-0 ${getAvatarBg(
                        user.role,
                        user.status
                      )}`}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${
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
                      {!isActive && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
                          <ShieldAlert className="w-3 h-3" strokeWidth={2} /> Inactivo
                        </span>
                      )}
                    </div>
                  </div>

                  <h3
                    className={`text-lg font-black uppercase tracking-tighter mt-1 leading-tight line-clamp-2 transition-colors ${
                      isActive ? 'text-uecg-dark dark:text-zinc-100 group-hover:text-uecg-blue dark:group-hover:text-blue-400' : 'text-uecg-gray dark:text-zinc-400'
                    }`}
                    title={user.name}
                  >
                    {user.name}
                  </h3>

                  <div className="mt-auto w-full">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest truncate ${
                        isActive ? 'text-uecg-gray dark:text-zinc-400' : 'text-gray-400 dark:text-zinc-500'
                      }`}
                      title={user.email}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* BARRA INFERIOR DE ACCIONES */}
                <div className="w-full border-t border-uecg-line dark:border-zinc-800 flex h-12 relative z-10">
                  {isActive ? (
                    <>
                      {/* Activo: Editar, Resetear y Desactivar */}
                      <button
                        type="button"
                        onClick={() => onAction('edit', user)}
                        className="flex-1 px-4 flex items-center justify-between transition-colors outline-none h-full bg-gray-50 dark:bg-zinc-900 hover:bg-uecg-blue dark:hover:bg-blue-600 group/edit cursor-pointer"
                      >
                        <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 group-hover/edit:text-white transition-colors">
                          Editar Perfil
                        </span>
                        <ArrowRight className="w-4 h-4 text-uecg-gray dark:text-zinc-400 group-hover/edit:text-white group-hover/edit:translate-x-1 transition-all" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onAction('reset', user)}
                        className="w-12 h-full flex items-center justify-center border-l border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-uecg-gray dark:text-zinc-400 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 transition-colors outline-none cursor-pointer"
                        title="Resetear Clave"
                      >
                        <Key className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onAction('delete', user)}
                        className="w-12 h-full flex items-center justify-center border-l border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-uecg-gray dark:text-zinc-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors outline-none cursor-pointer"
                        title="Desactivar Usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    /* Inactivo: Solo Reactivar */
                    <button
                      type="button"
                      onClick={() => onAction('reactivate', user)}
                      className="w-full px-4 flex items-center justify-center transition-colors outline-none h-full bg-gray-100 dark:bg-zinc-800 hover:bg-green-600 group/reactivate cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-gray-500 dark:text-zinc-400 group-hover/reactivate:text-white transition-colors" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 group-hover/reactivate:text-white transition-colors">
                          Reactivar Usuario
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
