import { ArrowRight, BookOpen, Trash2 } from 'lucide-react'
import { SwissEmptyState } from '@/shared/ui'
import type { Subject } from '../types/subjects.types'
import type { DrawerMode } from '../hooks/use-subjects-data'

interface SubjectsGridProps {
  subjects: Subject[]
  isPending: boolean
  isFetching: boolean
  onAction: (mode: DrawerMode, subject: Subject) => void
  onToggleStatus?: (subject: Subject) => void
  canManage: boolean
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
              className="border border-uecg-line bg-white h-[220px] animate-pulse"
            />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="border border-uecg-line bg-white shadow-sm">
          <SwissEmptyState
            icon={BookOpen}
            title="Sin materias encontradas"
            description="No se hallaron asignaturas en el catálogo para los filtros actuales."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {subjects.map((s) => {
            return (
              <div
                key={s.id}
                className={`group flex flex-col text-left border border-uecg-line bg-white h-[220px] relative overflow-hidden transition-all duration-300 ${
                  s.isActive
                    ? 'hover:border-uecg-blue hover:shadow-lg'
                    : 'opacity-75 bg-gray-50/70'
                }`}
              >
                {/* Geometría Decorativa Suizo */}
                {s.isActive && (
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-uecg-blue/5 rounded-none rotate-45 pointer-events-none group-hover:scale-150 group-hover:bg-uecg-blue/10 transition-transform duration-500" />
                )}

                {/* Contenido Principal */}
                <button
                  type="button"
                  disabled={!canManage}
                  onClick={() => {
                    if (canManage) onAction('edit', s)
                  }}
                  className={`p-5 flex-1 w-full text-left relative z-10 flex flex-col ${
                    canManage ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex justify-between items-start w-full mb-3">
                    <div className="w-10 h-10 bg-uecg-blue text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0">
                      {(s.code || s.name).substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-[10px] font-bold text-uecg-blue bg-blue-50 px-2 py-0.5 border border-blue-200">
                        {s.code || 'S/C'}
                      </span>
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border border-uecg-line bg-gray-100 text-uecg-dark transition-colors ${
                          canManage ? 'group-hover:border-blue-200 group-hover:text-uecg-blue' : ''
                        }`}
                      >
                        {s.level}
                      </span>
                    </div>
                  </div>

                  <h3
                    className={`text-lg font-black uppercase tracking-tighter text-uecg-dark mt-1 leading-tight line-clamp-2 transition-colors ${
                      canManage ? 'group-hover:text-uecg-blue' : ''
                    }`}
                    title={s.name}
                  >
                    {s.name}
                  </h3>

                  <div className="mt-auto w-full">
                    {s.area ? (
                      <span className="text-[9px] font-black text-uecg-blue uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5 truncate block w-fit max-w-full">
                        {s.area}
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest bg-gray-50 border border-uecg-line px-2 py-0.5 truncate block w-fit max-w-full">
                        General
                      </span>
                    )}
                  </div>
                </button>

                {/* Barra inferior: Editar y Eliminar */}
                <div className="w-full border-t border-uecg-line bg-gray-50 flex h-11 relative z-10">
                  <button
                    type="button"
                    onClick={() => {
                      if (canManage) onAction('edit', s)
                    }}
                    disabled={!canManage}
                    className={`flex-1 px-4 flex items-center justify-between transition-colors outline-none h-full ${
                      canManage ? 'hover:bg-uecg-blue group/edit cursor-pointer' : 'bg-gray-100 cursor-default'
                    }`}
                  >
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                        canManage
                          ? 'text-uecg-gray group-hover/edit:text-white'
                          : 'text-gray-400'
                      }`}
                    >
                      Editar Materia
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 transition-all ${
                        canManage
                          ? 'text-uecg-gray group-hover/edit:text-white group-hover/edit:translate-x-1'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => onAction('delete', s)}
                      className="w-11 h-full flex items-center justify-center border-l border-uecg-line bg-gray-50 text-uecg-gray hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors outline-none cursor-pointer"
                      title="Eliminar Asignatura"
                    >
                      <Trash2 className="w-4 h-4" />
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
