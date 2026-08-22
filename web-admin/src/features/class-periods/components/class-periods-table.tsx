import { Trash2, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ClassPeriod } from '../types/class-periods.types'

interface ClassPeriodsTableProps {
  periods: ClassPeriod[]
  isLoading: boolean
  isDeleting: boolean
  onDelete: (id: string) => void
}

export default function ClassPeriodsTable({
  periods,
  isLoading,
  isDeleting,
  onDelete,
}: ClassPeriodsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32 bg-gray-50 border border-uecg-line shadow-sm">
        <Loader2 className="w-6 h-6 animate-spin text-uecg-blue" aria-label="Cargando períodos de clase" />
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
            <th className="p-3 text-[9px] font-black uppercase tracking-widest text-uecg-gray text-center w-16">
              Baja
            </th>
          </tr>
        </thead>
        <motion.tbody layout>
          {periods.map((p) => (
            <motion.tr
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -10 }}
              key={p.id}
              className="border-b border-uecg-line hover:bg-gray-50 transition-colors"
            >
              <td className="p-3 text-xs font-black text-center text-gray-400 border-r border-uecg-line bg-gray-50/50">
                {p.order}
              </td>
              <td className="p-3 text-[11px] font-black uppercase tracking-widest text-uecg-dark border-r border-uecg-line">
                {p.name}
              </td>
              <td className="p-3 text-center text-[11px] font-bold uppercase tracking-widest text-uecg-gray border-r border-uecg-line font-mono">
                {p.startTime} <span className="text-gray-300 mx-1">—</span> {p.endTime}
              </td>
              <td className="p-3 text-center border-r border-uecg-line">
                {p.isBreak ? (
                  <span className="text-[9px] font-black bg-yellow-50 text-yellow-700 px-2 py-1 border border-yellow-200">
                    Recreo
                  </span>
                ) : (
                  <span className="text-[9px] font-black bg-blue-50 text-blue-700 px-2 py-1 border border-blue-200">
                    Clase
                  </span>
                )}
              </td>
              <td className="p-3 text-center">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => onDelete(p.id)}
                  aria-label={`Eliminar período ${p.name}`}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600/50 rounded transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  )
}
