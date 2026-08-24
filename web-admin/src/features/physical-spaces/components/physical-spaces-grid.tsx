import { ArrowRight, Trash2 } from 'lucide-react'
import { SwissEmptyState } from '@/shared/ui'
import type { PhysicalSpace } from '../types/physical-spaces.types'

interface PhysicalSpacesGridProps {
  spaces: PhysicalSpace[]
  isPending: boolean
  onEdit: (space: PhysicalSpace) => void
  onDeletePrompt: (space: PhysicalSpace) => void
  canManage: boolean
}

const getBadgeStyles = (type: string) => {
  if (type === 'LABORATORIO') return 'bg-indigo-600 text-white border-indigo-600'
  if (type === 'CANCHA') return 'bg-green-600 text-white border-green-600'
  if (type === 'AUDITORIO') return 'bg-purple-600 text-white border-purple-600'
  if (type === 'OTRO') return 'bg-gray-600 text-white border-gray-600'
  return 'bg-uecg-blue text-white border-uecg-blue'
}

const getLetter = (type: string) => {
  if (type === 'LABORATORIO') return 'L'
  if (type === 'CANCHA') return 'C'
  if (type === 'AUDITORIO') return 'A'
  if (type === 'OTRO') return 'O'
  return 'S'
}

export default function PhysicalSpacesGrid({
  spaces,
  isPending,
  onEdit,
  onDeletePrompt,
  canManage,
}: PhysicalSpacesGridProps) {
  return (
    <div
      className={`transition-opacity duration-200 pb-16 ${
        isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'
      }`}
    >
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-space-${i}`}
              className="border border-uecg-line bg-white h-[200px] animate-pulse shadow-sm"
            />
          ))}
        </div>
      ) : spaces.length === 0 ? (
        <div className="border border-uecg-line bg-white shadow-sm">
          <SwissEmptyState
            title="Infraestructura Vacía"
            description="No se encontraron espacios físicos registrados para los filtros seleccionados."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {spaces.map((space, index) => {
            const letter = getLetter(space.type)

            return (
              <div
                key={space.id}
                className="border border-uecg-line bg-white shadow-sm flex flex-col justify-between hover:border-uecg-blue hover:shadow-md transition-all duration-300 animate-in fade-in zoom-in-95 group fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Cabecera del Card */}
                <div className="p-5 flex items-start gap-4">
                  <div
                    className={`w-12 h-12 flex items-center justify-center font-black text-xl shadow-inner shrink-0 ${getBadgeStyles(
                      space.type
                    )}`}
                  >
                    {letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black uppercase tracking-tight text-xs text-uecg-dark truncate group-hover:text-uecg-blue transition-colors">
                      {space.name}
                    </p>
                    <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest mt-0.5 truncate">
                      ID: {space.id.split('-')[0]}
                    </p>
                    <p className="text-[10px] font-black text-uecg-text uppercase tracking-widest mt-1.5 truncate">
                      {space.type}
                    </p>
                  </div>
                </div>

                {/* Subheader / Estado */}
                <div className="px-5 py-3 bg-gray-50/50 border-t border-b border-uecg-line flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray">
                    Disponibilidad:
                  </span>
                  {space.isActive ? (
                    <span className="text-[9px] font-black uppercase tracking-widest text-green-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Activo
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Inactivo
                    </span>
                  )}
                </div>

                {/* Botones de acción */}
                {canManage && (
                  <div className="p-3 bg-white flex items-center justify-between gap-2">
                    <button
                      onClick={() => onEdit(space)}
                      className="flex-1 py-1.5 px-3 border border-uecg-line text-uecg-gray hover:text-uecg-blue hover:border-uecg-blue text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      Editar <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeletePrompt(space)}
                      className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Eliminar Espacio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
