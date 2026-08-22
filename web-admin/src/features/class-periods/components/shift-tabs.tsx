import { motion } from 'framer-motion'
import type { ShiftType } from '../types/class-periods.types'

interface ShiftTabsProps {
  selectedShift: ShiftType
  onShiftChange: (shift: ShiftType) => void
}

export default function ShiftTabs({ selectedShift, onShiftChange }: ShiftTabsProps) {
  const shifts: { value: ShiftType; label: string }[] = [
    { value: 'MANANA', label: 'MAÑANA' },
    { value: 'TARDE', label: 'TARDE' },
    { value: 'NOCHE', label: 'NOCHE' },
  ]

  return (
    <div className="flex flex-wrap gap-2 border-b border-uecg-line mb-6 pb-4">
      {shifts.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onShiftChange(value)}
          className="relative px-5 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer group"
        >
          <span
            className={`relative z-10 transition-colors duration-300 ${
              selectedShift === value
                ? 'text-white'
                : 'text-uecg-gray group-hover:text-uecg-text'
            }`}
          >
            Turno {label}
          </span>
          {selectedShift === value && (
            <motion.div
              layoutId="activeCampanarioTab"
              className="absolute inset-0 bg-uecg-dark border border-uecg-dark"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
