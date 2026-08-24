import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Loader2, Trash2, X, Clock } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ClassPeriod } from '../types/class-periods.types'

interface DeleteClassPeriodDrawerProps {
  isOpen: boolean
  onClose: () => void
  period: ClassPeriod | null
  onConfirm: (id: string) => void
  isDeleting: boolean
}

export default function DeleteClassPeriodDrawer({
  isOpen,
  onClose,
  period,
  onConfirm,
  isDeleting,
}: DeleteClassPeriodDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  // Accesibilidad: Focus Trapping y cerrar con Escape
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose()
      }
      if (e.key === 'Tab') {
        if (!drawerRef.current) return
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousFocus = document.activeElement as HTMLElement

    setTimeout(() => {
      const cancelButton = drawerRef.current?.querySelector('button[type="button"]') as HTMLElement
      cancelButton?.focus()
    }, 50)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus?.()
    }
  }, [isOpen, isDeleting, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && period && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop optimizado para GPU */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={!isDeleting ? onClose : undefined}
            className="fixed inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Swiss Minimalist */}
          <motion.div
            ref={drawerRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-period-title"
            aria-describedby="delete-period-description"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-white border border-uecg-line shadow-2xl overflow-hidden z-10 will-change-transform transform-gpu"
          >
            {/* Header con advertencia roja */}
            <div className="bg-red-50/80 border-b border-red-100 p-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id="delete-period-title"
                    className="text-sm font-black uppercase tracking-tight text-red-950"
                  >
                    Baja de Período Escolar
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-700/80 mt-0.5">
                    Confirmación de Eliminación
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={onClose}
                aria-label="Cerrar modal"
                className="text-gray-400 hover:text-gray-600 p-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-uecg-blue/50 cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6">
              <p
                id="delete-period-description"
                className="text-xs text-uecg-text leading-relaxed mb-4"
              >
                ¿Está seguro de que desea eliminar el siguiente bloque de horario? Esta acción eliminará permanentemente la hora si no cuenta con horarios ni asistencias asociadas.
              </p>

              {/* Ficha del Período */}
              <div className="p-4 bg-gray-50 border border-uecg-line mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-uecg-dark text-white flex items-center justify-center text-xs font-black">
                    {period.order}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-uecg-dark tracking-wide">
                      {period.name}
                    </p>
                    <p className="text-[10px] font-bold text-uecg-gray flex items-center gap-1 mt-0.5 font-mono">
                      <Clock className="w-3 h-3 text-uecg-blue" />
                      {period.startTime} — {period.endTime} ({period.shift})
                    </p>
                  </div>
                </div>
                {period.isBreak ? (
                  <span className="text-[9px] font-black bg-yellow-50 text-yellow-700 px-2 py-1 border border-yellow-200 uppercase">
                    Recreo
                  </span>
                ) : (
                  <span className="text-[9px] font-black bg-blue-50 text-blue-700 px-2 py-1 border border-blue-200 uppercase">
                    Clase
                  </span>
                )}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-none text-[10px] text-amber-900 leading-snug">
                <span className="font-bold uppercase tracking-wider">Nota de Integridad:</span> Si este período ya tiene asistencias u horarios asignados, desactívelo editándolo en lugar de eliminarlo para conservar el historial académico.
              </div>
            </div>

            {/* Footer de Acciones */}
            <div className="bg-gray-50 border-t border-uecg-line px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={onClose}
                className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray hover:text-uecg-dark hover:bg-gray-200/60 border border-gray-300 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => onConfirm(period.id)}
                className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 active:bg-red-800 text-white flex items-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-600/50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Período</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
