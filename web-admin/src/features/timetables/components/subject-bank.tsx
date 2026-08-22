import { Droppable, Draggable } from '@hello-pangea/dnd'
import { BookOpen, User, GripVertical } from 'lucide-react'
import type { TeacherAssignment } from '@/features/teacher-assignments/types/teacher-assignments.types'

interface SubjectBankProps {
  assignments: TeacherAssignment[]
}

export function SubjectBank({ assignments }: SubjectBankProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-uecg-line bg-gray-50/50">
        <h3 className="text-xs font-black uppercase tracking-widest text-uecg-dark flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-uecg-blue" /> Banco de Materias
        </h3>
        <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest mt-1.5 leading-relaxed">
          Arrastra y suelta las materias asignadas sobre la grilla horaria.
        </p>
      </div>

      <Droppable droppableId="bank" isDropDisabled={true}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar select-none transition-colors duration-200
              ${snapshot.isDraggingOver ? 'bg-gray-50' : 'bg-white'}
            `}
          >
            {assignments.length === 0 ? (
              <div className="border border-dashed border-uecg-line p-8 text-center bg-gray-50/50">
                <p className="text-[10px] uppercase font-black tracking-widest text-uecg-gray">
                  Sin materias vinculadas
                </p>
              </div>
            ) : (
              assignments.map((assignment, index) => {
                // Generamos un ID de arrastre único y seguro
                const draggableId = `${assignment.id}_${index}`

                return (
                  <Draggable
                    key={assignment.id}
                    draggableId={draggableId}
                    index={index}
                  >
                    {(draggable, dragSnapshot) => (
                      <div
                        ref={draggable.innerRef}
                        {...draggable.draggableProps}
                        {...draggable.dragHandleProps}
                        className={`flex items-start gap-2.5 p-3.5 border transition-all duration-200 rounded-none bg-white
                          ${
                            dragSnapshot.isDragging
                              ? 'border-uecg-blue shadow-2xl scale-[1.03] z-50 bg-blue-50/20'
                              : 'border-uecg-line hover:border-uecg-blue hover:shadow-md'
                          }
                        `}
                        style={draggable.draggableProps.style}
                      >
                        <div className="text-uecg-gray group-hover:text-uecg-blue shrink-0 mt-0.5" aria-hidden="true">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-tight text-uecg-dark leading-tight truncate">
                            {assignment.subject.name}
                          </p>
                          <p className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest mt-1 flex items-center gap-1 leading-none truncate">
                            <User className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                            {assignment.teacher.fullName}
                          </p>
                        </div>
                      </div>
                    )}
                  </Draggable>
                )
              })
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
export default SubjectBank
