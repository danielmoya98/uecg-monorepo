import { motion, AnimatePresence } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

export interface SwissMorphIconProps {
  icon: LucideIcon
  size?: number | string
  strokeWidth?: number | string
  className?: string
  color?: string
}

/**
 * Transición elástica de iconos basada en Framer Motion y física de resortes (Spring Physics).
 * 100% compatible con React 19 y Lucide React sin dependencias externas inestables.
 */
export function SwissMorphIcon({
  icon: Icon,
  size = 16,
  strokeWidth = 2,
  className = '',
  color,
}: SwissMorphIconProps) {
  const iconKey = Icon?.displayName || Icon?.name || 'icon'

  return (
    <span
      className={`inline-flex items-center justify-center relative overflow-hidden select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={iconKey}
          initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 24,
            mass: 0.6,
          }}
          className="flex items-center justify-center w-full h-full"
        >
          {Icon && (
            <Icon
              size={size}
              strokeWidth={strokeWidth}
              color={color}
              className="w-full h-full"
            />
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export { SwissMorphIcon as MorphIcon }
export default SwissMorphIcon
