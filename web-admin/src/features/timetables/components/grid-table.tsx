import { Droppable } from '@hello-pangea/dnd'
import { Trash2, Pencil } from 'lucide-react'
import type { ClassPeriod, TimetableSlot } from '../types/timetables.types'

const DAYS = [
  { id: 1, name: 'LUNES' },
  { id: 2, name: 'MARTES' },
  { id: 3, name: 'MIÉRCOLES' },
  { id: 4, name: 'JUEVES' },
  { id: 5, name: 'VIERNES' },
]

interface GridTableProps {
  periods: ClassPeriod[]
  scheduleSlots: TimetableSlot[]
  onDeleteSlot?: (id: string) => void
  onEditSpace?: (slot: TimetableSlot) => void
  isDeleting?: boolean
  institutionMode?: string
  canManage: boolean
  currentUserId?: string
}

export function GridTable({
  periods,
  scheduleSlots,
  onDeleteSlot,
  onEditSpace,
  isDeleting,
  institutionMode,
  canManage,
  currentUserId,
}: GridTableProps) {
  return (
    <div className="w-full overflow-x-auto border border-uecg-line bg-white shadow-md custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
        <thead>
          <tr className="bg-uecg-dark text-white border-b border-uecg-dark">
            <th
              scope="col"
              className="p-3.5 text-[9px] font-black uppercase tracking-widest border-r border-white/20 w-24 text-center shrink-0"
            >
              Bloque
            </th>
            {DAYS.map((day) => (
              <th
                key={day.id}
                scope="col"
                className="p-3.5 text-[9px] font-black uppercase tracking-widest border-r border-white/20 text-center"
              >
                {day.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period.id} className="border-b border-uecg-line">
              {/* COLUMNA DE HORAS (Compacta) */}
              <td
                className={`p-2.5 border-r border-uecg-line text-center flex flex-col justify-center h-full min-h-[65px] ${
                  period.isBreak ? 'bg-gray-100' : 'bg-gray-50'
                }`}
              >
                <p className="text-[9px] font-black uppercase tracking-tight text-uecg-dark leading-none">
                  {period.name}
                </p>
                <p className="text-[8px] font-bold text-uecg-gray tracking-widest mt-1.5 leading-tight">
                  {period.startTime} <br /> {period.endTime}
                </p>
              </td>

              {/* COLUMNAS DE DÍAS */}
              {DAYS.map((day) => {
                if (period.isBreak) {
                  return (
                    <td
                      key={`break_${day.id}_${period.id}`}
                      className="p-2 border-r border-uecg-line bg-gray-50 text-center relative overflow-hidden"
                    >
                      <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1), repeating-linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1)',
                          backgroundPosition: '0 0, 10px 10px',
                          backgroundSize: '20px 20px',
                        }}
                        aria-hidden="true"
                      />
                      {day.id === 3 && (
                        <span className="relative z-10 text-[9px] font-black uppercase tracking-widest text-uecg-gray/50 bg-gray-50 px-2.5">
                          R E C R E O
                        </span>
                      )}
                    </td>
                  )
                }

                const existingSlot = scheduleSlots.find(
                  (s) => s.dayOfWeek === day.id && s.classPeriodId === period.id
                )
                const droppableId = `slot_${day.id}_${period.id}`

                let canEditSpace = false
                if (existingSlot && canManage) {
                  const subjectName = existingSlot.teacherAssignment.subject.name.toLowerCase()
                  const isSpecialSubject =
                    subjectName.includes('educación física') ||
                    subjectName.includes('educacion fisica')
                  canEditSpace = institutionMode === 'DYNAMIC' || isSpecialSubject
                }

                // LÓGICA DE COLORES INTELIGENTES
                const isMySubject =
                  !canManage && existingSlot?.teacherAssignment?.teacher?.id === currentUserId
                const isOtherSubject = !canManage && existingSlot && !isMySubject

                // Definimos las clases CSS según a quién le pertenece el slot
                let slotWrapperClasses =
                  'h-full w-full p-2 flex flex-col justify-center items-center text-center relative transition-all duration-200 '
                let textClasses =
                  'text-[9px] font-black uppercase tracking-tight leading-tight line-clamp-2 w-full px-2 '
                let tagClasses =
                  'mt-1 text-[7px] font-bold uppercase tracking-widest px-1 py-0.5 border truncate max-w-full '

                if (canManage) {
                  // Vista ADMIN: Todo se ve normal y editable
                  slotWrapperClasses +=
                    'bg-blue-50/50 border-l-[3px] border-l-uecg-blue border border-transparent shadow-sm hover:border-uecg-blue hover:bg-blue-50'
                  textClasses += 'text-uecg-dark'
                  tagClasses += 'text-uecg-gray bg-white border-uecg-line shadow-sm'
                } else if (isMySubject) {
                  // Vista DOCENTE (Materia Propia): Destacado en azul vibrante
                  slotWrapperClasses +=
                    'bg-blue-100/80 border-l-[4px] border-l-uecg-blue border border-uecg-blue shadow-md scale-[1.02] z-10'
                  textClasses += 'text-uecg-blue font-black'
                  tagClasses += 'text-white bg-uecg-blue border-uecg-blue shadow-sm'
                } else if (isOtherSubject) {
                  // Vista DOCENTE (Materia de Otro): Apagado / Gris
                  slotWrapperClasses +=
                    'bg-gray-50/50 border-l-[2px] border-l-gray-300 border border-transparent opacity-60 grayscale'
                  textClasses += 'text-gray-400'
                  tagClasses += 'text-gray-400 bg-transparent border-gray-300'
                }

                return (
                  <td
                    key={droppableId}
                    className="p-1 border-r border-uecg-line relative h-[65px] group"
                  >
                    {existingSlot ? (
                      <div className={slotWrapperClasses}>
                        <p className={textClasses}>{existingSlot.teacherAssignment.subject.name}</p>

                        {/* Aula Asignada */}
                        {existingSlot.physicalSpace && (
                          <div className={tagClasses}>{existingSlot.physicalSpace.name}</div>
                        )}

                        {/* Botón de Eliminación (Solo Admin) */}
                        {canManage && onDeleteSlot && (
                          <button
                            type="button"
                            onClick={() => onDeleteSlot(existingSlot.id)}
                            disabled={isDeleting}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-white hover:bg-red-600 transition-all p-1 bg-white border border-red-100 rounded-none shadow-sm cursor-pointer outline-none focus:opacity-100"
                            title="Eliminar del horario"
                            aria-label={`Eliminar ${existingSlot.teacherAssignment.subject.name} del horario`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}

                        {/* Botón de Edición de Aula (Solo Admin y si cumple condiciones) */}
                        {canEditSpace && onEditSpace && (
                          <button
                            type="button"
                            onClick={() => onEditSpace(existingSlot)}
                            className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 text-uecg-blue hover:text-white hover:bg-uecg-blue transition-all p-1 bg-white border border-blue-100 rounded-none shadow-sm cursor-pointer outline-none focus:opacity-100"
                            title="Cambiar Aula"
                            aria-label={`Cambiar aula para ${existingSlot.teacherAssignment.subject.name}`}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : canManage ? (
                      <Droppable droppableId={droppableId}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`h-full w-full transition-all flex items-center justify-center border-2 border-transparent 
                              ${
                                snapshot.isDraggingOver
                                  ? 'bg-blue-50/50 border-dashed !border-uecg-blue scale-[0.96]'
                                  : 'hover:bg-gray-50/50'
                              }
                            `}
                          >
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    ) : (
                      <div className="h-full w-full bg-white/50 border-2 border-transparent" />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default GridTable
