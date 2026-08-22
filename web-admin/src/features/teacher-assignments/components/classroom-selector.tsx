import { BookOpen, ChevronRight, MapPin } from 'lucide-react'
import type { Classroom } from '@/features/classrooms/types/classrooms.types'

const ClassroomBadge = ({ section, level, isActive }: { section: string; level: string; isActive: boolean }) => {
  let bgColor = isActive ? 'bg-white text-uecg-blue' : 'bg-uecg-blue text-white'
  if (!isActive && level === 'INICIAL') bgColor = 'bg-green-600 text-white'
  if (!isActive && level === 'SECUNDARIA') bgColor = 'bg-uecg-dark text-white'

  return (
    <div
      className={`w-10 h-10 flex items-center justify-center font-black text-lg shadow-sm shrink-0 transition-colors border border-transparent ${bgColor}`}
    >
      {section}
    </div>
  )
}

interface ClassroomSelectorProps {
  classrooms: Classroom[]
  selectedId?: string
  onSelect: (classroom: Classroom) => void
  isFixedBaseMode?: boolean
}

export const ClassroomSelector = ({
  classrooms,
  selectedId,
  onSelect,
  isFixedBaseMode,
}: ClassroomSelectorProps) => {
  return (
    <div className="flex flex-col h-full bg-white border border-uecg-line shadow-sm">
      <div className="bg-gray-50 border-b border-uecg-line p-5 shrink-0">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-uecg-gray flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-uecg-blue" /> Seleccione un Aula
        </h2>
      </div>

      <div className="flex flex-col max-h-[65vh] overflow-y-auto custom-scrollbar">
        {classrooms.length === 0 ? (
          <div className="p-8 text-center opacity-70">
            <div className="w-12 h-12 border-2 border-dashed border-uecg-line mx-auto mb-3 flex items-center justify-center rotate-45"></div>
            <p className="text-[10px] uppercase font-bold text-uecg-gray">No hay cursos registrados.</p>
          </div>
        ) : (
          classrooms.map((c) => {
            const isActive = selectedId === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c)}
                className={`flex items-center justify-between p-4 border-b transition-all text-left group cursor-pointer ${
                  isActive
                    ? 'border-uecg-blue bg-uecg-blue shadow-md relative z-10'
                    : 'border-uecg-line bg-white hover:bg-blue-50/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <ClassroomBadge section={c.section} level={c.level} isActive={isActive} />
                  <div className="flex flex-col gap-0.5">
                    <p
                      className={`font-black text-sm uppercase tracking-tight leading-none ${
                        isActive ? 'text-white' : 'text-uecg-text'
                      }`}
                    >
                      {c.grade}
                    </p>
                    <p
                      className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${
                        isActive ? 'text-blue-100' : 'text-uecg-gray'
                      }`}
                    >
                      {c.level} • {c.shift}
                    </p>

                    {isFixedBaseMode && (
                      <div
                        className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest mt-1.5 ${
                          !c.baseRoom
                            ? isActive
                              ? 'text-red-200'
                              : 'text-red-500'
                            : isActive
                              ? 'text-white'
                              : 'text-uecg-blue/80'
                        }`}
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        {c.baseRoom ? c.baseRoom.name : 'SIN AULA BASE'}
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    isActive
                      ? 'text-white translate-x-1'
                      : 'text-uecg-line group-hover:text-uecg-blue group-hover:translate-x-1'
                  }`}
                />
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ClassroomSelector
