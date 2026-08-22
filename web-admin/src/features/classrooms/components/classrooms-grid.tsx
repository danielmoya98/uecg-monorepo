import { Edit3, Trash2, ShieldAlert, Loader2, Inbox, MapPin, UserCheck, Users } from 'lucide-react'
import type { Classroom } from '../types/classrooms.types'

interface ClassroomsGridProps {
  classrooms: Classroom[]
  isPending: boolean
  isFetching: boolean
  currentYearExists: boolean
  onAction: (action: 'edit' | 'delete', classroom: Classroom) => void
  canManage: boolean
}

const LEVEL_THEMES: Record<
  string,
  { border: string; bg: string; text: string; accent: string; bar: string }
> = {
  INICIAL: {
    border: 'border-yellow-200',
    bg: 'bg-yellow-50/40',
    text: 'text-yellow-700',
    accent: 'bg-yellow-600',
    bar: 'bg-yellow-500',
  },
  PRIMARIA: {
    border: 'border-blue-200',
    bg: 'bg-blue-50/40',
    text: 'text-blue-700',
    accent: 'bg-blue-600',
    bar: 'bg-blue-500',
  },
  SECUNDARIA: {
    border: 'border-purple-200',
    bg: 'bg-purple-50/40',
    text: 'text-purple-700',
    accent: 'bg-purple-600',
    bar: 'bg-purple-500',
  },
}

const SHIFT_LABELS: Record<string, string> = {
  MANANA: 'Mañana',
  TARDE: 'Tarde',
  NOCHE: 'Noche',
}

export const ClassroomsGrid = ({
  classrooms,
  isPending,
  isFetching,
  currentYearExists,
  onAction,
  canManage,
}: ClassroomsGridProps) => {
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
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full transition-opacity duration-200 ${
        isFetching ? 'opacity-60' : 'opacity-100'
      }`}
    >
      {classrooms.map((c) => {
        const theme = LEVEL_THEMES[c.level] || {
          border: 'border-uecg-line',
          bg: 'bg-gray-50/40',
          text: 'text-uecg-gray',
          accent: 'bg-uecg-gray',
          bar: 'bg-gray-400',
        }

        // Simulación de porcentaje visual para el cupo
        const capacityPercentage = Math.min(Math.max((c.capacity / 50) * 100, 20), 100)

        return (
          <article
            key={c.id}
            className={`relative flex flex-col justify-between border bg-white p-5 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.15)] hover:border-uecg-dark transition-all duration-300 group overflow-hidden ${theme.border}`}
          >
            {/* Cabecera de la Tarjeta */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border ${theme.border} ${theme.bg} ${theme.text}`}
                  >
                    {c.level}
                  </span>
                  <span className="px-2 py-0.5 text-[8px] font-bold text-uecg-gray bg-gray-50 border border-uecg-line uppercase tracking-widest">
                    {SHIFT_LABELS[c.shift] || c.shift}
                  </span>
                </div>
                <h3 className="text-2xl mt-3 font-black tracking-tighter uppercase text-uecg-dark leading-none">
                  {c.grade}
                  <span className={`block text-lg font-bold tracking-normal mt-0.5 ${theme.text}`}>
                    Paralelo "{c.section}"
                  </span>
                </h3>
              </div>

              {/* Distintivo de brutalismo */}
              <div
                className={`w-9 h-9 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm ${theme.accent}`}
              >
                {c.section}
              </div>
            </div>

            {/* Divisor */}
            <hr className="border-uecg-line my-4" />

            {/* Contenido / Atributos */}
            <div className="flex flex-col gap-3 flex-1">
              {/* Aula Física */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-gray-50 border border-uecg-line flex items-center justify-center text-uecg-gray group-hover:border-uecg-dark transition-colors shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest leading-none">
                    Aula Base
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-uecg-dark mt-0.5">
                    {c.baseRoom ? c.baseRoom.name : 'Sin Asignar'}
                  </span>
                </div>
              </div>

              {/* Asesor */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-gray-50 border border-uecg-line flex items-center justify-center text-uecg-gray group-hover:border-uecg-dark transition-colors shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest leading-none">
                    Docente Asesor
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-uecg-dark mt-0.5 truncate max-w-[200px]">
                    {c.advisor ? c.advisor.fullName : 'Sin Asesor / Tutor'}
                  </span>
                </div>
              </div>

              {/* Capacidad y Barra de Progreso */}
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-uecg-gray">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-uecg-blue" />
                    Capacidad Permitida
                  </span>
                  <span className="font-black text-uecg-dark">{c.capacity} Cupos</span>
                </div>
                <div className="w-full h-2 bg-gray-100 border border-uecg-line overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500 ${theme.bar}`}
                    style={{ width: `${capacityPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Acciones de la Tarjeta */}
            {canManage && (
              <div className="flex items-center gap-2 mt-5 border-t border-uecg-line/50 pt-4">
                <button
                  type="button"
                  onClick={() => onAction('edit', c)}
                  className="flex-1 px-3 py-2 border border-uecg-line text-uecg-gray hover:text-uecg-blue hover:border-uecg-blue hover:bg-blue-50/10 font-bold text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => onAction('delete', c)}
                  className="flex-1 px-3 py-2 border border-uecg-line text-uecg-gray hover:text-red-600 hover:border-red-600 hover:bg-red-50/10 font-bold text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Eliminar
                </button>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
export default ClassroomsGrid
