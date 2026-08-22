import { Edit3, Trash2, ShieldAlert, Loader2, Inbox, MapPin, UserCheck, Users } from 'lucide-react'
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
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-uecg-line bg-gray-50/50 shadow-sm w-full min-h-[300px]">
        <Loader2 className="w-8 h-8 text-uecg-blue animate-spin mb-4" />
        <span className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest animate-pulse">
          Consultando registros académicos en el RUE...
        </span>
      </div>
    )
  }

  if (!currentYearExists) {
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

  if (classrooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-uecg-line bg-white shadow-sm w-full min-h-[300px]">
        <Inbox className="w-10 h-10 text-uecg-gray mb-4" />
        <h3 className="text-sm font-black uppercase tracking-tight text-uecg-dark">
          Sin Aulas Registradas
        </h3>
        <p className="text-[10px] text-uecg-gray uppercase tracking-widest leading-relaxed max-w-sm mt-2">
          No se encontraron aulas académicas para los filtros seleccionados en la gestión vigente.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full border border-uecg-line bg-white shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-uecg-line text-uecg-gray font-black text-[9px] uppercase tracking-widest select-none">
              <th className="px-6 py-4 border-r border-uecg-line">Código / Aula</th>
              <th className="px-6 py-4 border-r border-uecg-line">Nivel Educativo</th>
              <th className="px-6 py-4 border-r border-uecg-line">Turno</th>
              <th className="px-6 py-4 border-r border-uecg-line text-center">Capacidad</th>
              <th className="px-6 py-4 border-r border-uecg-line">Aula Física (Base)</th>
              <th className="px-6 py-4 border-r border-uecg-line">Asesor / Tutor</th>
              {canManage && <th className="px-6 py-4 text-center">Acciones</th>}
            </tr>
          </thead>
          <tbody className={`divide-y divide-uecg-line transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
            {classrooms.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-gray-50/50 transition-colors text-uecg-text"
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
                <td className="px-6 py-4 border-r border-uecg-line text-[10px] font-bold uppercase tracking-widest">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default ClassroomsTable
