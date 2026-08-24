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
  INICIAL: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  PRIMARIA: 'border-blue-200 bg-blue-50 text-blue-700',
  SECUNDARIA: 'border-purple-200 bg-purple-50 text-purple-700',
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
      <div className="flex flex-col items-center justify-center p-12 text-center border border-yellow-200 bg-yellow-50/50 shadow-sm w-full min-h-[300px]">
        <ShieldAlert className="w-10 h-10 text-yellow-600 mb-4 animate-bounce" />
        <h3 className="text-sm font-black uppercase tracking-tight text-yellow-800">
          Sin Gestión Académica Activa
        </h3>
        <p className="text-[10px] text-yellow-700/80 uppercase tracking-widest leading-relaxed max-w-sm mt-2">
          Debe activar o crear una gestión escolar vigente en el panel de administradores para listar o registrar aulas.
        </p>
      </div>
    )
  }

  return (
    <SwissTableContainer isFetching={isFetching} isPending={isPending}>
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead className="sticky top-0 z-20 bg-gray-50 dark:bg-zinc-900 border-b border-uecg-line dark:border-zinc-800 shadow-sm">
          <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-uecg-line dark:border-zinc-800 text-uecg-gray dark:text-zinc-400 font-black text-[9px] uppercase tracking-widest select-none">
            <th className="px-6 py-3.5 border-r border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">Código / Aula</th>
            <th className="px-6 py-3.5 border-r border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">Nivel Educativo</th>
            <th className="px-6 py-3.5 border-r border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">Turno</th>
            <th className="px-6 py-3.5 border-r border-uecg-line dark:border-zinc-800 text-center bg-gray-50 dark:bg-zinc-900">Capacidad</th>
            <th className="px-6 py-3.5 border-r border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">Aula Física (Base)</th>
            <th className="px-6 py-3.5 border-r border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">Asesor / Tutor</th>
            {canManage && <th className="px-6 py-3.5 text-center bg-gray-50 dark:bg-zinc-900">Acciones</th>}
          </tr>
        </thead>

        <tbody>
          {isPending ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-classroom-${i}`} className="border-b border-uecg-line animate-pulse">
                <td className="px-6 py-4 border-r border-uecg-line">
                  <div className="h-4 w-28 bg-gray-200" />
                </td>
                <td className="px-6 py-4 border-r border-uecg-line">
                  <div className="h-5 w-20 bg-gray-200" />
                </td>
                <td className="px-6 py-4 border-r border-uecg-line">
                  <div className="h-4 w-16 bg-gray-200" />
                </td>
                <td className="px-6 py-4 border-r border-uecg-line">
                  <div className="h-5 w-12 bg-gray-200 mx-auto" />
                </td>
                <td className="px-6 py-4 border-r border-uecg-line">
                  <div className="h-4 w-24 bg-gray-200" />
                </td>
                <td className="px-6 py-4 border-r border-uecg-line">
                  <div className="h-4 w-32 bg-gray-200" />
                </td>
                {canManage && (
                  <td className="px-6 py-4">
                    <div className="h-4 w-12 bg-gray-200 mx-auto" />
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
                className="border-b border-uecg-line hover:bg-blue-50/20 transition-colors text-uecg-text animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Código / Aula */}
                <td className="px-6 py-4 border-r border-uecg-line font-black uppercase text-xs text-uecg-dark tracking-tighter">
                  {c.grade} "{c.section}"
                </td>

                {/* Nivel */}
                <td className="px-6 py-4 border-r border-uecg-line">
                  <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                    LEVEL_COLORS[c.level] || 'border-uecg-line bg-gray-50 text-uecg-gray'
                  }`}>
                    {c.level}
                  </span>
                </td>

                {/* Turno */}
                <td className="px-6 py-4 border-r border-uecg-line text-[10px] font-bold uppercase tracking-widest text-uecg-text">
                  {SHIFT_LABELS[c.shift] || c.shift}
                </td>

                {/* Capacidad */}
                <td className="px-6 py-4 border-r border-uecg-line text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs font-black text-uecg-dark flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-uecg-blue" />
                      {c.capacity}
                    </span>
                    <span className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest mt-0.5">
                      Cupos Máx.
                    </span>
                  </div>
                </td>

                {/* Aula Física */}
                <td className="px-6 py-4 border-r border-uecg-line text-[10px] font-bold uppercase tracking-widest">
                  {c.baseRoom ? (
                    <span className="flex items-center gap-1.5 text-uecg-dark">
                      <MapPin className="w-3.5 h-3.5 text-uecg-gray shrink-0" />
                      {c.baseRoom.name}
                    </span>
                  ) : (
                    <span className="text-gray-400 font-medium italic">Sin Asignar</span>
                  )}
                </td>

                {/* Tutor */}
                <td className="px-6 py-4 border-r border-uecg-line text-[10px] font-bold uppercase tracking-widest">
                  {c.advisor ? (
                    <span className="flex items-center gap-1.5 text-uecg-dark">
                      <UserCheck className="w-3.5 h-3.5 text-uecg-blue shrink-0" />
                      {c.advisor.fullName}
                    </span>
                  ) : (
                    <span className="text-gray-400 font-medium italic">Sin Asesor</span>
                  )}
                </td>

                {/* Acciones */}
                {canManage && (
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onAction('edit', c)}
                        className="p-2 border border-uecg-line text-uecg-gray hover:text-uecg-blue hover:border-uecg-blue transition-all cursor-pointer outline-none hover:bg-blue-50/20"
                        title="Editar Curso"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onAction('delete', c)}
                        className="p-2 border border-uecg-line text-uecg-gray hover:text-red-600 hover:border-red-600 transition-all cursor-pointer outline-none hover:bg-red-50/20"
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
