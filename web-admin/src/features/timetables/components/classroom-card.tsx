import { ArrowRight } from 'lucide-react'
import type { Classroom } from '@/features/classrooms/types/classrooms.types'

interface ClassroomCardProps {
  classroom: Classroom
  onClick: (classroom: Classroom) => void
  canManage: boolean
}

export function ClassroomCard({ classroom, onClick, canManage }: ClassroomCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(classroom)}
      className="group flex flex-col text-left border border-uecg-line bg-white hover:border-uecg-blue hover:shadow-lg transition-all duration-300 h-44 relative overflow-hidden outline-none cursor-pointer focus:ring-2 focus:ring-uecg-blue focus:ring-offset-2"
      aria-label={`${canManage ? 'Abrir editor de horarios para' : 'Ver horario de'} ${classroom.grade} grado, sección ${classroom.section}, nivel ${classroom.level}`}
    >
      {/* Visual background diamond premium decoration */}
      <div
        className="absolute -right-8 -bottom-8 w-24 h-24 bg-uecg-blue/5 rounded-none rotate-45 pointer-events-none group-hover:scale-150 group-hover:bg-uecg-blue/10 transition-transform duration-500"
        aria-hidden="true"
      />

      <div className="p-5 flex-1 w-full relative z-10">
        <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest border border-uecg-line px-2 py-0.5 bg-gray-50 group-hover:border-blue-200 group-hover:text-uecg-blue transition-colors">
          Turno {classroom.shift}
        </span>
        <h3 className="text-2xl font-black uppercase tracking-tighter text-uecg-dark mt-3 leading-none group-hover:text-uecg-blue transition-colors">
          {classroom.grade} "{classroom.section}"
        </h3>
        <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest mt-1.5">
          Nivel {classroom.level}
        </p>
      </div>

      <div className="w-full p-4 border-t border-uecg-line bg-gray-50 flex items-center justify-between group-hover:bg-uecg-blue group-hover:border-uecg-blue transition-colors relative z-10">
        <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray group-hover:text-white">
          {canManage ? 'Abrir Editor' : 'Ver Horario'}
        </span>
        <ArrowRight
          className="w-4 h-4 text-uecg-gray group-hover:text-white group-hover:translate-x-1 transition-all duration-200"
          aria-hidden="true"
        />
      </div>
    </button>
  )
}
