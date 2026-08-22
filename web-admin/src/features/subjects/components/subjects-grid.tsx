import { ArrowRight, BookMarked, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
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
  if (isPending) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`skeleton-grid-${i}`}
            className="border border-uecg-line bg-white h-[200px] animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (subjects.length === 0) {
    return (
      <div className="border border-uecg-line bg-white flex flex-col items-center justify-center py-20 opacity-80 shadow-sm animate-in fade-in zoom-in-95">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-uecg-line rounded-none rotate-12" />
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-gray-100 -rotate-12" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 shadow-sm border border-uecg-line">
            <BookMarked className="w-6 h-6 text-uecg-gray" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="font-black uppercase tracking-widest text-xs text-uecg-dark mb-1">
          Catálogo Vacío
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-uecg-gray">
          No se encontraron materias con estos filtros.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`transition-opacity duration-200 pb-16 ${
        isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subjects.map((s, index) => {
          const initial = s.name.charAt(0).toUpperCase()

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className={`group flex flex-col text-left border border-uecg-line bg-white h-[200px] relative overflow-hidden transition-all duration-300 ${
                canManage ? 'hover:border-uecg-blue hover:shadow-lg' : 'opacity-95'
              }`}
            >
              {/* Fondo Abstracto Geométrico Bauhaus (Solo interactivo para directores/admins) */}
              {canManage && (
                <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-uecg-blue/5 rounded-none rotate-45 pointer-events-none group-hover:scale-150 group-hover:bg-uecg-blue/10 transition-transform duration-500" />
              )}

              {/* Botón Principal: abre el drawer de edición */}
              <button
                type="button"
                onClick={() => {
                  if (canManage) onAction('edit', s)
                }}
                disabled={!canManage}
                className={`p-5 flex-1 w-full relative z-10 flex flex-col text-left outline-none focus:bg-gray-50/50 transition-colors ${
                  canManage ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex justify-between items-start w-full mb-3">
                  <div
                    className={`w-10 h-10 flex items-center justify-center ${getAvatarBg(
                      s.level
                    )} text-white font-black text-xl shadow-sm shrink-0`}
                  >
                    {initial}
                  </div>
                  <span
                    className={`text-[9px] font-black text-uecg-gray uppercase tracking-widest border border-uecg-line px-2 py-0.5 bg-gray-50 transition-colors ${
                      canManage ? 'group-hover:border-blue-200 group-hover:text-uecg-blue' : ''
                    }`}
                  >
                    {s.level}
                  </span>
                </div>

                <h3
                  className={`text-xl font-black uppercase tracking-tighter text-uecg-dark mt-2 leading-none transition-colors line-clamp-2 ${
                    canManage ? 'group-hover:text-uecg-blue' : ''
                  }`}
                  title={s.name}
                >
                  {s.name}
                </h3>

                <div className="mt-auto w-full">
                  {s.area ? (
                    <span className="text-[9px] font-black text-uecg-blue uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-1 truncate block w-fit max-w-full">
                      ÁREA: {s.area}
                    </span>
                  ) : (
                    <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest bg-gray-50 border border-uecg-line px-2 py-1 truncate block w-fit max-w-full">
                      Sin Categoría
                    </span>
                  )}
                </div>
              </button>

              {/* Barra inferior: Editar y Eliminar (con escudo ABAC) */}
              <div className="w-full border-t border-uecg-line bg-gray-50 flex h-12 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    if (canManage) onAction('edit', s)
                  }}
                  disabled={!canManage}
                  className={`flex-1 px-4 flex items-center justify-between transition-colors outline-none h-full focus:ring-2 focus:ring-uecg-blue ${
                    canManage ? 'hover:bg-uecg-blue group/edit cursor-pointer' : 'bg-gray-100 cursor-default'
                  }`}
                >
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                      canManage ? 'text-uecg-gray group-hover/edit:text-white' : 'text-gray-400'
                    }`}
                  >
                    {canManage ? 'Abrir Editor' : 'Solo Lectura'}
                  </span>

                  {canManage && (
                    <ArrowRight className="w-4 h-4 text-uecg-gray group-hover/edit:text-white group-hover/edit:translate-x-1 transition-all" />
                  )}
                </button>

                {canManage && (
                  <button
                    type="button"
                    onClick={() => onAction('delete', s)}
                    className="w-12 h-full flex items-center justify-center border-l border-uecg-line bg-gray-50 text-uecg-gray hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
                    title="Eliminar Materia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
