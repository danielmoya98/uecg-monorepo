import { CalendarDays, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { DailyBlock } from '../types/attendance.types'

interface BlockSelectorProps {
  dailyBlocks: DailyBlock[]
  isLoadingBlocks: boolean
  selectedBlock: DailyBlock | null
  setSelectedBlock: (block: DailyBlock) => void
  isPowerUser: boolean
}

export const BlockSelector = ({
  dailyBlocks,
  isLoadingBlocks,
  selectedBlock,
  setSelectedBlock,
  isPowerUser,
}: BlockSelectorProps) => {
  const todayStr = new Date().toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="bg-white border border-uecg-line p-5 shadow-sm relative">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-uecg-gray flex items-center gap-2">
          <span className="w-4 h-4 bg-uecg-blue text-white flex items-center justify-center font-mono text-[8px]">
            1
          </span>
          Seleccione un Bloque de Clases
        </label>
        <div className="border border-uecg-line bg-gray-50 px-3 py-1 flex items-center gap-2 text-[10px] font-bold text-uecg-gray uppercase tracking-widest">
          <CalendarDays className="w-3 h-3 text-uecg-blue" />
          HOY ({todayStr})
        </div>
      </div>

      {isLoadingBlocks ? (
        <div className="flex justify-center p-8 border border-dashed border-uecg-line">
          <Loader2 className="w-6 h-6 animate-spin text-uecg-blue" />
        </div>
      ) : dailyBlocks.length === 0 ? (
        <div className="p-8 border border-dashed border-uecg-line text-center bg-gray-50 select-none">
          <p className="text-xs font-bold text-uecg-gray uppercase tracking-widest">
            No tiene clases asignadas para el día de hoy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dailyBlocks.map((block) => {
            const isSelected = selectedBlock?.id === block.id

            return (
              <motion.button
                key={block.id}
                type="button"
                onClick={() => setSelectedBlock(block)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`p-4 border text-left transition-all relative overflow-hidden outline-none cursor-pointer group ${
                  isSelected
                    ? 'border-uecg-blue bg-uecg-blue text-white shadow-md'
                    : 'border-uecg-line bg-white hover:border-uecg-blue hover:shadow-sm'
                }`}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeBlockBorder"
                    className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-400"
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                )}
                <div className="flex items-center justify-between mb-2 select-none">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                      isSelected
                        ? 'bg-white/20 border-white/30 text-white'
                        : 'bg-gray-100 border-gray-200 text-uecg-gray'
                    }`}
                  >
                    {block.startTime} - {block.endTime}
                  </span>
                  <span
                    className={`text-[8px] font-bold uppercase tracking-widest ${
                      isSelected ? 'text-blue-200' : 'text-uecg-gray'
                    }`}
                  >
                    {block.classPeriodIds.length} Periodo(s)
                  </span>
                </div>
                <h3
                  className={`text-sm font-black uppercase tracking-tighter truncate leading-tight ${
                    isSelected ? 'text-white' : 'text-uecg-dark'
                  }`}
                >
                  {block.subjectName}
                </h3>

                {isPowerUser && block.teacherName && (
                  <p
                    className={`text-[9px] font-black uppercase truncate mt-0.5 ${
                      isSelected ? 'text-blue-200' : 'text-uecg-blue'
                    }`}
                  >
                    Prof. {block.teacherName}
                  </p>
                )}

                <p
                  className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 ${
                    isSelected ? 'text-blue-100' : 'text-uecg-gray'
                  }`}
                >
                  {block.classroom.grade} "{block.classroom.section}" - {block.classroom.level}
                </p>
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}
