import { ArrowRight, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { SwissEmptyState } from '@/shared/ui'
import type { Subject } from '../types/subjects.types'
import type { DrawerMode } from '../hooks/use-subjects-data'

interface SubjectsGridProps {
  subjects: Subject[]
  isPending: boolean
  isFetching: boolean
  onAction: (mode: DrawerMode, subject: Subject) => void
  canManage: boolean
}

const getAvatarBg = (level: string) => {
  if (level === 'INICIAL') return 'bg-green-600'
  if (level === 'SECUNDARIA') return 'bg-uecg-dark'
  return 'bg-uecg-blue'
}

export default function SubjectsGrid({
  subjects,
  isPending,
  isFetching,
  onAction,
  canManage,
}: SubjectsGridProps) {
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
              key={`skeleton-subject-grid-${i}`}
              className="border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] h-[210px] animate-pulse"
            />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm">
          <SwissEmptyState
            title="Catálogo Vacío"
            description="No se encontraron materias con los filtros actuales."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((s, index) => {
            const initial = s.name.charAt(0).toUpperCase()

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className={`group flex flex-col text-left border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] h-[210px] relative overflow-hidden transition-all duration-300 ${
                  !s.isActive ? 'bg-gray-50/70 dark:bg-zinc-900/70 opacity-80' : ''
                } ${
                  canManage ? 'hover:border-uecg-blue dark:hover:border-blue-500 hover:shadow-lg' : 'opacity-95'
                }`}
              >
                {/* Fondo Abstracto Geométrico Bauhaus */}
                {canManage && (
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-uecg-blue/5 dark:bg-blue-500/10 rounded-none rotate-45 pointer-events-none group-hover:scale-150 group-hover:bg-uecg-blue/10 dark:group-hover:bg-blue-500/20 transition-transform duration-500" />
                )}

                {/* Botón Principal: abre el drawer de edición */}
                <button
                  type="button"
                  onClick={() => {
                    if (canManage) onAction('edit', s)
                  }}
                  disabled={!canManage}
                  className={`p-4 flex-1 w-full relative z-10 flex flex-col text-left outline-none transition-colors ${
                    canManage ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex justify-between items-start w-full mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 flex items-center justify-center ${getAvatarBg(
                          s.level
                        )} text-white font-black text-lg shadow-sm shrink-0`}
                      >
                        {initial}
                      </div>
                      {s.code && (
                        <span className="text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 border border-uecg-line dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-uecg-dark dark:text-zinc-200">
                          {s.code}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border ${
                          s.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40'
                            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
                        }`}
                      >
                        {s.isActive ? 'ACTIVA' : 'INACTIVA'}
                      </span>
                      <span
                        className={`text-[8px] font-black text-uecg-gray dark:text-zinc-400 uppercase tracking-widest border border-uecg-line dark:border-zinc-700 px-1.5 py-0.5 bg-gray-50 dark:bg-zinc-800 transition-colors ${
                          canManage ? 'group-hover:border-blue-200 group-hover:text-uecg-blue dark:group-hover:text-blue-400' : ''
                        }`}
                      >
                        {s.level}
                      </span>
                    </div>
                  </div>

                  <h3
                    className={`text-lg font-black uppercase tracking-tighter text-uecg-dark dark:text-zinc-100 mt-1 leading-tight transition-colors line-clamp-2 ${
                      canManage ? 'group-hover:text-uecg-blue dark:group-hover:text-blue-400' : ''
                    }`}
                    title={s.name}
                  >
                    {s.name}
                  </h3>

                  <div className="mt-auto w-full">
                    {s.area ? (
                      <span className="text-[9px] font-black text-uecg-blue dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 px-2 py-0.5 truncate block w-fit max-w-full">
                        {s.area}
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-uecg-gray dark:text-zinc-500 uppercase tracking-widest bg-gray-50 dark:bg-zinc-800/60 border border-uecg-line dark:border-zinc-700 px-2 py-0.5 truncate block w-fit max-w-full">
                        General
                      </span>
                    )}
                  </div>

                </button>

                {/* Barra inferior: Editar y Eliminar */}
                <div className="w-full border-t border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 flex h-11 relative z-10">
                  <button
                    type="button"
                    onClick={() => {
                      if (canManage) onAction('edit', s)
                    }}
                    disabled={!canManage}
                    className={`flex-1 px-4 flex items-center justify-between transition-colors outline-none h-full ${
                      canManage ? 'hover:bg-uecg-blue dark:hover:bg-blue-600 group/edit cursor-pointer' : 'bg-gray-100 dark:bg-zinc-800 cursor-default'
                    }`}
                  >
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                        canManage ? 'text-uecg-gray dark:text-zinc-400 group-hover/edit:text-white' : 'text-gray-400 dark:text-zinc-600'
                      }`}
                    >
                      {canManage ? 'Abrir Editor' : 'Solo Lectura'}
                    </span>

                    {canManage && (
                      <ArrowRight className="w-4 h-4 text-uecg-gray dark:text-zinc-400 group-hover/edit:text-white group-hover/edit:translate-x-1 transition-all" />
                    )}
                  </button>

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => onAction('delete', s)}
                      className="w-11 h-full flex items-center justify-center border-l border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-uecg-gray dark:text-zinc-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors outline-none cursor-pointer"
                      title="Eliminar Materia"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
