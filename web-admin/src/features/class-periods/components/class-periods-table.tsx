import { Trash2, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ClassPeriod } from '../types/class-periods.types'

interface ClassPeriodsTableProps {
  periods: ClassPeriod[]
  isLoading: boolean
  isDeleting: boolean
  onEdit: (period: ClassPeriod) => void
  onDelete: (period: ClassPeriod) => void
}

export default function ClassPeriodsTable({
  periods,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
}: ClassPeriodsTableProps) {
  if (isLoading) {
    return (
      <div className="border border-uecg-line flex-1 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-uecg-line">
            <tr>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest text-uecg-gray w-12 text-center border-r border-uecg-line">#</th>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">Bloque Académico</th>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest text-uecg-gray text-center border-r border-uecg-line">Horario</th>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest text-uecg-gray text-center border-r border-uecg-line">Naturaleza</th>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest text-uecg-gray text-center border-r border-uecg-line">Estado</th>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest text-uecg-gray text-center w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={`period-sk-${i}`} className="border-b border-uecg-line animate-pulse">
                <td className="p-3 text-center border-r border-uecg-line">
                  <div className="h-4 w-4 bg-gray-200 mx-auto" />
                </td>
                <td className="p-3 border-r border-uecg-line">
                  <div className="h-4 w-32 bg-gray-200" />
                </td>
                <td className="p-3 border-r border-uecg-line text-center">
                  <div className="h-4 w-24 bg-gray-100 mx-auto" />
                </td>
                <td className="p-3 border-r border-uecg-line text-center">
                  <div className="h-4 w-16 bg-gray-100 mx-auto" />
                </td>
                <td className="p-3 border-r border-uecg-line text-center">
                  <div className="h-4 w-16 bg-gray-200 mx-auto" />
                </td>
                <td className="p-3 text-center">
                  <div className="h-6 w-12 bg-gray-200 mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (periods.length === 0) {
    return (
      <div className="p-12 text-center bg-gray-50/50 border border-uecg-line shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">
          El cronograma está vacío
        </p>
      </div>
    )
  }

  return (
    <div className="border border-uecg-line flex-1 overflow-x-auto shadow-sm">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead className="bg-gray-50 border-b border-uecg-line">
          <tr>
            <th className="p-3 text-[9px] font-black uppercase tracking-widest text-uecg-gray w-12 text-center border-r border-uecg-line">
              #
            </th>
            <th className="p-3 text-[9px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Bloque Académico
            </th>
            <th className="p-3 text-[9px] font-black uppercase tracking-widest text-uecg-gray text-center border-r border-uecg-line">
              Horario
            </th>
            <th className="p-3 text-[9px] font-black uppercase tracking-widest text-uecg-gray text-center border-r border-uecg-line">
              Naturaleza
            </th>
            <th className="p-3 text-[9px] font-black uppercase tracking-widest text-uecg-gray text-center border-r border-uecg-line">
              Estado
            </th>
            <th className="p-3 text-[9px] font-black uppercase tracking-widest text-uecg-gray text-center w-24">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <motion.tr
              key={period.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border-b border-uecg-line hover:bg-blue-50/20 transition-colors"
            >
              <td className="p-3 font-mono text-[10px] font-bold text-uecg-gray border-r border-uecg-line text-center">
                {period.order}
              </td>
              <td className="p-3 font-black uppercase tracking-tight text-uecg-dark text-xs border-r border-uecg-line">
                {period.name || `Periodo ${period.order}`}
              </td>
              <td className="p-3 font-mono text-[11px] font-bold text-uecg-text border-r border-uecg-line text-center">
                {period.startTime} - {period.endTime}
              </td>
              <td className="p-3 border-r border-uecg-line text-center">
                <span
                  className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                    period.isBreak
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-blue-50 text-uecg-blue border-blue-100'
                  }`}
                >
                  {period.isBreak ? 'Receso' : 'Pedagógico'}
                </span>
              </td>
              <td className="p-3 border-r border-uecg-line text-center">
                <span
                  className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                    period.isActive
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}
                >
                  {period.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(period)}
                    className="text-uecg-gray hover:text-uecg-blue transition-colors focus:outline-none cursor-pointer"
                    title="Editar Periodo"
                    aria-label={`Editar periodo ${period.order}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(period)}
                    disabled={isDeleting}
                    className="text-uecg-gray hover:text-red-600 transition-colors focus:outline-none cursor-pointer disabled:opacity-50"
                    title="Eliminar Periodo"
                    aria-label={`Eliminar periodo ${period.order}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
