import { ArrowRight, MapPin, Trash2 } from 'lucide-react'
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
  return 'bg-uecg-blue text-white border-uecg-blue' // SALON
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
      className={`transition-opacity duration-200 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
    >
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="border border-uecg-line bg-white h-[200px] animate-pulse shadow-sm"
            ></div>
          ))}
        </div>
      ) : spaces.length === 0 ? (
        <div className="border border-uecg-line bg-white flex flex-col items-center justify-center py-20 opacity-80 animate-in fade-in zoom-in-95 shadow-sm">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-uecg-line rounded-none rotate-45"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gray-100 -rotate-12"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 shadow-sm border border-uecg-line">
              <MapPin className="w-6 h-6 text-uecg-gray" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="font-black uppercase tracking-widest text-xs text-uecg-dark mb-1">
            Infraestructura Vacía
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-uecg-gray">
            No se encontraron espacios físicos registrados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {spaces.map((space) => {
            return (
              <div
                key={space.id}
                className={`group flex flex-col text-left border border-uecg-line bg-white h-[200px] relative overflow-hidden transition-all duration-300 ${
                  canManage ? 'hover:border-uecg-blue hover:shadow-lg' : 'opacity-90'
                }`}
              >
                {/* Fondo Abstracto Geométrico */}
                {canManage && (
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-uecg-blue/5 rounded-none rotate-45 pointer-events-none group-hover:scale-150 group-hover:bg-uecg-blue/10 transition-transform duration-500"></div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (canManage) onEdit(space)
                  }}
                  disabled={!canManage}
                  className={`p-5 flex-1 w-full relative z-10 flex flex-col text-left outline-none focus:bg-gray-50/50 transition-colors ${
                    canManage ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex justify-between items-start w-full mb-3">
                    <div
                      className={`w-10 h-10 flex items-center justify-center font-black text-xl shadow-sm shrink-0 border ${getBadgeStyles(
                        space.type
                      )}`}
                    >
                      {getLetter(space.type)}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border shadow-sm bg-gray-50 text-uecg-gray border-uecg-line">
                        {space.type}
                      </span>
                      {space.isActive ? (
                        <span className="flex items-center text-[8px] font-black text-green-700 uppercase tracking-widest mt-1">
                          <span className="w-1.5 h-1.5 bg-green-500 mr-1.5 rounded-full animate-pulse"></span>{' '}
                          ACTIVO
                        </span>
                      ) : (
                        <span className="flex items-center text-[8px] font-black text-red-700 uppercase tracking-widest mt-1">
                          <span className="w-1.5 h-1.5 bg-red-500 mr-1.5 rounded-full"></span>{' '}
                          INACTIVO
                        </span>
                      )}
                    </div>
                  </div>

                  <h3
                    className={`text-xl font-black uppercase tracking-tighter text-uecg-dark mt-1 leading-tight transition-colors line-clamp-2 ${
                      canManage ? 'group-hover:text-uecg-blue' : ''
                    }`}
                    title={space.name}
                  >
                    {space.name}
                  </h3>

                  <div className="mt-auto w-full">
                    <span className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest">
                      ID: {space.id.split('-')[0]}
                    </span>
                  </div>
                </button>

                {/* BARRA INFERIOR DE ACCIONES */}
                <div className="w-full border-t border-uecg-line bg-gray-50 flex h-12 relative z-10">
                  <button
                    type="button"
                    onClick={() => {
                      if (canManage) onEdit(space)
                    }}
                    disabled={!canManage}
                    className={`flex-1 px-4 flex items-center justify-between transition-colors outline-none h-full cursor-pointer ${
                      canManage ? 'hover:bg-uecg-blue group/edit' : 'bg-gray-100 cursor-default'
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
                      onClick={() => onDeletePrompt(space)}
                      className="w-12 h-full flex items-center justify-center border-l border-uecg-line bg-gray-50 text-uecg-gray hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors outline-none cursor-pointer"
                      title="Eliminar Espacio"
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
