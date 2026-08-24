import { Edit3, Trash2, ShieldAlert, MapPin, UserCheck, Users } from 'lucide-react'
import { SwissTableContainer, SwissEmptyState } from '@/shared/ui'
import type { Classroom } from '../types/classrooms.types'

interface ClassroomsTableProps {
  classrooms: Classroom[]
  isPending: boolean
  isFetching: boolean
  currentYearExists: boolean
  onAction: (action: 'edit' | 'delete', classroom: Classroom) => void
  canManage: boolean
}

const LEVEL_COLORS: Record<string, string> = {
  INICIAL: 'border-yellow-200 dark:border-yellow-900/40 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400',
  PRIMARIA: 'border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400',
  SECUNDARIA: 'border-purple-200 dark:border-purple-900/40 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400',
}

const SHIFT_LABELS: Record<string, string> = {
  MANANA: 'Mañana',
  TARDE: 'Tarde',
  NOCHE: 'Noche',
}

export const ClassroomsTable = ({
  classrooms,
  isPending,
  isFetching,
  currentYearExists,
  onAction,
  canManage,
}: ClassroomsTableProps) => {
  if (!currentYearExists && !isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-yellow-200 dark:border-yellow-900/40 bg-yellow-50/50 dark:bg-yellow-950/20 shadow-sm w-full min-h-[300px]">
        <ShieldAlert className="w-10 h-10 text-yellow-600 dark:text-yellow-400 mb-4 animate-bounce" />
        <h3 className="text-sm font-black uppercase tracking-tight text-yellow-800 dark:text-yellow-300">
          Sin Gestión Académica Activa
        </h3>
        <p className="text-[10px] text-yellow-700/80 dark:text-yellow-400/80 uppercase tracking-widest leading-relaxed max-w-sm mt-2">
          Debe activar o crear una gestión escolar vigente en el panel de administradores para listar o registrar aulas.
        </p>
      </div>
    )
  }

  return (
    <SwissTableContainer isFetching={isFetching} isPending={isPending}>
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-uecg-line dark:border-zinc-800 text-uecg-gray dark:text-zinc-400 font-black text-[9px] uppercase tracking-widest select-none">
            <th className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800">Código / Aula</th>
            <th className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800">Nivel Educativo</th>
            <th className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800">Turno</th>
            <th className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800 text-center">Capacidad</th>
            <th className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800">Aula Física (Base)</th>
            <th className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800">Asesor / Tutor</th>
            {canManage && <th className="px-6 py-4 text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-classroom-${i}`} className="border-b border-uecg-line dark:border-zinc-800 animate-pulse">
                <td className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-4 w-28 bg-gray-200 dark:bg-zinc-800" />
                </td>
                <td className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-5 w-20 bg-gray-200 dark:bg-zinc-800" />
                </td>
                <td className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-zinc-800" />
                </td>
                <td className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-5 w-12 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                </td>
                <td className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-800" />
                </td>
                <td className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-800" />
                </td>
                {canManage && (
                  <td className="px-6 py-4">
                    <div className="h-4 w-12 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                  </td>
                )}
              </tr>
            ))
          ) : classrooms.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 7 : 6} className="p-0">
                <SwissEmptyState
                  title="Sin Aulas Registradas"
                  description="No se encontraron aulas académicas para los filtros seleccionados en la gestión vigente."
                />
              </td>
            </tr>
          ) : (
            classrooms.map((c, index) => (
              <tr
                key={c.id}
                className="border-b border-uecg-line dark:border-zinc-800 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors text-uecg-text dark:text-zinc-200 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Código / Aula */}
                <td className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800 font-black uppercase text-xs text-uecg-dark dark:text-zinc-100 tracking-tighter">
                  {c.grade} "{c.section}"
                </td>

                {/* Nivel */}
                <td className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                    LEVEL_COLORS[c.level] || 'border-uecg-line dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-uecg-gray dark:text-zinc-300'
                  }`}>
                    {c.level}
                  </span>
                </td>

                {/* Turno */}
                <td className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-uecg-text dark:text-zinc-300">
                  {SHIFT_LABELS[c.shift] || c.shift}
                </td>

                {/* Capacidad */}
                <td className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs font-black text-uecg-dark dark:text-zinc-100 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-uecg-blue dark:text-blue-400" />
                      {c.capacity}
                    </span>
                    <span className="text-[8px] font-bold text-uecg-gray dark:text-zinc-400 uppercase tracking-widest mt-0.5">
                      Cupos Máx.
                    </span>
                  </div>
                </td>

                {/* Aula Física */}
                <td className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest">
                  {c.baseRoom ? (
                    <span className="flex items-center gap-1.5 text-uecg-dark dark:text-zinc-200">
                      <MapPin className="w-3.5 h-3.5 text-uecg-gray dark:text-zinc-400 shrink-0" />
                      {c.baseRoom.name}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-zinc-500 font-medium italic">Sin Asignar</span>
                  )}
                </td>

                {/* Tutor */}
                <td className="px-6 py-4 border-r border-uecg-line dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest">
                  {c.advisor ? (
                    <span className="flex items-center gap-1.5 text-uecg-dark dark:text-zinc-200">
                      <UserCheck className="w-3.5 h-3.5 text-uecg-blue dark:text-blue-400 shrink-0" />
                      {c.advisor.fullName}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-zinc-500 font-medium italic">Sin Asesor</span>
                  )}
                </td>

                {/* Acciones */}
                {canManage && (
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onAction('edit', c)}
                        className="p-2 border border-uecg-line dark:border-zinc-800 text-uecg-gray dark:text-zinc-400 hover:text-uecg-blue dark:hover:text-blue-400 hover:border-uecg-blue dark:hover:border-blue-500 transition-all cursor-pointer outline-none hover:bg-blue-50/20 dark:hover:bg-blue-950/20"
                        title="Editar Curso"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onAction('delete', c)}
                        className="p-2 border border-uecg-line dark:border-zinc-800 text-uecg-gray dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-500 transition-all cursor-pointer outline-none hover:bg-red-50/20 dark:hover:bg-red-950/20"
                        title="Eliminar Curso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </SwissTableContainer>
  )
}
export default ClassroomsTable
