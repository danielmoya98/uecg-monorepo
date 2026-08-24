import { Edit3, Trash2, ShieldAlert, MapPin, UserCheck, Users } from 'lucide-react'
import { SwissEmptyState } from '@/shared/ui'
import type { Classroom } from '../types/classrooms.types'

interface ClassroomsGridProps {
  classrooms: Classroom[]
  isPending: boolean
  isFetching: boolean
  currentYearExists: boolean
  onAction: (action: 'edit' | 'delete', classroom: Classroom) => void
  canManage: boolean
}

const LEVEL_THEMES: Record<
  string,
  { border: string; bg: string; text: string; accent: string; bar: string }
> = {
  INICIAL: {
    border: 'border-yellow-200 dark:border-yellow-900/40',
    bg: 'bg-yellow-50/40 dark:bg-yellow-950/10',
    text: 'text-yellow-700 dark:text-yellow-400',
    accent: 'bg-yellow-600',
    bar: 'bg-yellow-500',
  },
  PRIMARIA: {
    border: 'border-blue-200 dark:border-blue-900/40',
    bg: 'bg-blue-50/40 dark:bg-blue-950/10',
    text: 'text-blue-700 dark:text-blue-400',
    accent: 'bg-blue-600',
    bar: 'bg-blue-500',
  },
  SECUNDARIA: {
    border: 'border-purple-200 dark:border-purple-900/40',
    bg: 'bg-purple-50/40 dark:bg-purple-950/10',
    text: 'text-purple-700 dark:text-purple-400',
    accent: 'bg-purple-600',
    bar: 'bg-purple-500',
  },
}

const SHIFT_LABELS: Record<string, string> = {
  MANANA: 'Mañana',
  TARDE: 'Tarde',
  NOCHE: 'Noche',
}

export const ClassroomsGrid = ({
  classrooms,
  isPending,
  isFetching,
  currentYearExists,
  onAction,
  canManage,
}: ClassroomsGridProps) => {
  if (!currentYearExists && !isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-yellow-200 dark:border-yellow-900/40 bg-yellow-50/50 dark:bg-yellow-950/20 shadow-sm w-full min-h-[300px]">
        <ShieldAlert className="w-10 h-10 text-yellow-600 dark:text-yellow-400 mb-4 animate-bounce" />
        <h3 className="text-sm font-black uppercase tracking-tight text-yellow-800 dark:text-yellow-300">
          Sin Gestión Académica Activa
        </h3>
        <p className="text-[10px] text-yellow-700/80 dark:text-yellow-400/80 uppercase tracking-widest leading-relaxed max-w-sm mt-2">
          Debe activar o crear una gestión escolar vigente en el panel de administradores para listar o registrar aulas.
        </p>
      </div>
    )
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
              key={`skeleton-classroom-grid-${i}`}
              className="border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] h-[220px] animate-pulse shadow-sm"
            />
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <div className="border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm">
          <SwissEmptyState
            title="Sin Aulas Registradas"
            description="No se encontraron aulas académicas para los filtros seleccionados en la gestión vigente."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {classrooms.map((c, index) => {
            const theme = LEVEL_THEMES[c.level] || {
              border: 'border-uecg-line dark:border-zinc-700',
              bg: 'bg-gray-50/40 dark:bg-zinc-800/40',
              text: 'text-uecg-dark dark:text-zinc-200',
              accent: 'bg-uecg-dark',
              bar: 'bg-uecg-dark',
            }

            return (
              <div
                key={c.id}
                className="border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm flex flex-col justify-between hover:border-uecg-blue dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 animate-in fade-in zoom-in-95 group fill-mode-both"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Cabecera del Card */}
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${theme.border} ${theme.bg} ${theme.text}`}
                      >
                        {c.level}
                      </span>
                      <span className="text-[8px] font-bold text-uecg-gray dark:text-zinc-400 uppercase tracking-widest">
                        {SHIFT_LABELS[c.shift] || c.shift}
                      </span>
                    </div>

                    <h3 className="font-black uppercase tracking-tight text-base text-uecg-dark dark:text-zinc-100 truncate group-hover:text-uecg-blue dark:group-hover:text-blue-400 transition-colors">
                      {c.grade} "{c.section}"
                    </h3>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-black text-uecg-dark dark:text-zinc-100 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-uecg-blue dark:text-blue-400" />
                      {c.capacity}
                    </span>
                    <span className="text-[8px] font-bold text-uecg-gray dark:text-zinc-400 uppercase tracking-widest">
                      Cupos
                    </span>
                  </div>
                </div>

                {/* Metadata / Asesor y Ambiente */}
                <div className="px-5 py-3 bg-gray-50/50 dark:bg-zinc-900/50 border-t border-b border-uecg-line dark:border-zinc-800 flex flex-col gap-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-uecg-gray dark:text-zinc-400 font-bold uppercase tracking-widest text-[9px]">
                      Ambiente:
                    </span>
                    {c.baseRoom ? (
                      <span className="font-black text-uecg-dark dark:text-zinc-200 uppercase tracking-tight flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-uecg-gray dark:text-zinc-400" />
                        {c.baseRoom.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-zinc-500 italic">Sin Asignar</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-uecg-gray dark:text-zinc-400 font-bold uppercase tracking-widest text-[9px]">
                      Asesor:
                    </span>
                    {c.advisor ? (
                      <span className="font-black text-uecg-dark dark:text-zinc-200 uppercase tracking-tight truncate max-w-[150px] flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-uecg-blue dark:text-blue-400 shrink-0" />
                        {c.advisor.fullName}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-zinc-500 italic">Sin Asesor</span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                {canManage && (
                  <div className="p-3 bg-white dark:bg-[#121214] flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onAction('edit', c)}
                      className="px-3 py-1.5 border border-uecg-line dark:border-zinc-700 text-uecg-gray dark:text-zinc-300 hover:text-uecg-blue dark:hover:text-blue-400 hover:border-uecg-blue dark:hover:border-blue-500 text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onAction('delete', c)}
                      className="px-3 py-1.5 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
export default ClassroomsGrid
