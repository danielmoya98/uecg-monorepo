import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, X, CheckSquare, Download, AlertTriangle } from 'lucide-react'
import { SwissKbd } from './swiss-kbd'

export interface SwissBatchAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'danger' | 'primary' | 'secondary'
  onClick: () => void
  isLoading?: boolean
}

export interface SwissBatchActionBarProps {
  selectedCount: number
  itemLabel?: string
  onClear: () => void
  actions?: SwissBatchAction[]
  onDelete?: () => void
  onExport?: () => void
  isDeleting?: boolean
}

/**
 * Barra flotante brutalista suiza para acciones masivas en tablas (Batch Actions).
 */
export function SwissBatchActionBar({
  selectedCount,
  itemLabel = 'registros',
  onClear,
  actions = [],
  onDelete,
  onExport,
  isDeleting = false,
}: SwissBatchActionBarProps) {
  const isVisible = selectedCount > 0

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-uecg-dark dark:bg-black text-white px-5 py-3 border border-white/20 dark:border-zinc-700 shadow-2xl select-none max-w-[90vw]"
        >
          <div className="flex items-center gap-2 border-r border-white/20 pr-4">
            <CheckSquare className="w-4 h-4 text-uecg-blue dark:text-blue-400" />
            <span className="text-xs font-black uppercase tracking-wider">
              {selectedCount}{' '}
              <span className="text-[10px] font-bold text-white/60 lowercase">
                {itemLabel}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={onDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <AlertTriangle className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
              </motion.button>
            )}

            {onExport && (
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={onExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer border border-white/10"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </motion.button>
            )}

            {actions.map((act, idx) => {
              const Icon = act.icon
              return (
                <motion.button
                  key={`batch-act-${idx}`}
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={act.onClick}
                  disabled={act.isLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                    act.variant === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : act.variant === 'primary'
                        ? 'bg-uecg-blue hover:bg-blue-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{act.label}</span>
                </motion.button>
              )
            })}

            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer ml-1"
              title="Cancelar selección (ESC)"
            >
              <X className="w-3.5 h-3.5" />
              <SwissKbd className="text-[8px] bg-white/10 border-white/20 text-white/80">
                ESC
              </SwissKbd>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default SwissBatchActionBar
