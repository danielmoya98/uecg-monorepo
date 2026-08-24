import { ArrowRight, BookOpen, MapPin, Trash2, UserCheck, Users } from 'lucide-react'
import { SwissEmptyState } from '@/shared/ui'
import type { Classroom } from '../types/classrooms.types'

interface ClassroomsGridProps {
  classrooms: Classroom[]
  isPending: boolean
  isFetching: boolean
  currentYearExists?: boolean
  onAction: (action: 'edit' | 'delete', classroom: Classroom) => void
  canManage: boolean
}


const getBadgeStyles = (level: string) => {
  if (level === 'INICIAL') return 'bg-yellow-500 text-white border-yellow-500'
  if (level === 'PRIMARIA') return 'bg-uecg-blue text-white border-uecg-blue'
  return 'bg-purple-600 text-white border-purple-600'
}

const getLabelStyles = (level: string) => {
  if (level === 'INICIAL') return 'bg-yellow-50 text-yellow-700 border-yellow-200'
  if (level === 'PRIMARIA') return 'bg-blue-50 text-uecg-blue border-blue-100'
  return 'bg-purple-50 text-purple-700 border-purple-200'
}

export function ClassroomsGrid({
  classrooms,
  isPending,
  isFetching,
  onAction,
  canManage,
}: ClassroomsGridProps) {

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
              className="border border-uecg-line bg-white h-[260px] animate-pulse"
            />
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <div className="border border-uecg-line bg-white shadow-sm">
          <SwissEmptyState
            icon={BookOpen}
            title="Sin Aulas Registradas"
            description="No se encontraron aulas académicas registradas para los filtros seleccionados."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {classrooms.map((c, index) => {
            return (
              <div
                key={c.id}
                className="border border-uecg-line bg-white shadow-sm flex flex-col justify-between hover:border-uecg-blue hover:shadow-md transition-all duration-300 animate-in fade-in zoom-in-95 group fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Cabecera del Card */}
                <div className="p-5 flex items-start gap-4">
                  <div
                    className={`w-12 h-12 flex items-center justify-center font-black text-xl shadow-inner shrink-0 ${getBadgeStyles(
                      c.level
                    )}`}
                  >
                    {c.section}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black uppercase tracking-tight text-sm text-uecg-dark truncate group-hover:text-uecg-blue transition-colors">
                      {c.grade} "{c.section}"
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${getLabelStyles(
                          c.level
                        )}`}
                      >
                        {c.level}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-uecg-gray">
                        • {c.shift}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metadata / Capacidad / Tutor */}
                <div className="px-5 py-3 bg-gray-50/50 border-t border-b border-uecg-line flex flex-col gap-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-uecg-gray uppercase tracking-widest flex items-center gap-1 text-[9px]">
                      <Users className="w-3.5 h-3.5 text-uecg-blue" /> Capacidad:
                    </span>
                    <span className="font-black text-uecg-dark">
                      {c.capacity} Estudiantes
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-uecg-gray uppercase tracking-widest flex items-center gap-1 text-[9px]">
                      <MapPin className="w-3.5 h-3.5 text-uecg-gray" /> Aula Base:
                    </span>
                    <span className="font-bold text-uecg-dark truncate max-w-[120px]">
                      {c.baseRoom ? c.baseRoom.name : 'Sin asignar'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-uecg-gray uppercase tracking-widest flex items-center gap-1 text-[9px]">
                      <UserCheck className="w-3.5 h-3.5 text-uecg-blue" /> Asesor:
                    </span>
                    <span className="font-bold text-uecg-dark truncate max-w-[120px]">
                      {c.advisor ? c.advisor.fullName : 'Sin tutor'}
                    </span>
                  </div>
                </div>

                {/* Botones de acción */}
                {canManage && (
                  <div className="p-3 bg-white flex items-center justify-between gap-2">
                    <button
                      onClick={() => onAction('edit', c)}
                      className="flex-1 py-1.5 px-3 border border-uecg-line text-uecg-gray hover:text-uecg-blue hover:border-uecg-blue text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      Editar Curso <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onAction('delete', c)}
                      className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Eliminar Aula"
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
export default ClassroomsGrid
