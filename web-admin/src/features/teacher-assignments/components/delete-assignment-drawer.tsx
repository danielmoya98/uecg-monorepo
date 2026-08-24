import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { TeacherAssignment } from '../types/teacher-assignments.types'

interface DeleteAssignmentDrawerProps {
  isOpen: boolean
  onClose: () => void
  assignment: TeacherAssignment | null
  onConfirm: (id: string) => void
  isSubmitting: boolean
}

export const DeleteAssignmentDrawer = ({
  isOpen,
  onClose,
  assignment,
  onConfirm,
  isSubmitting,
}: DeleteAssignmentDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null)

  // Accesibilidad: Focus Trapping y tecla Escape
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isSubmitting) onClose()
      }
      if (e.key === 'Tab') {
        if (!drawerRef.current) return
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements.length === 0) return
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

    // Enfocar primer botón interactivo después del delay de transición
    setTimeout(() => {
      const firstBtn = drawerRef.current?.querySelector('button:not([disabled])') as HTMLElement
      firstBtn?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [isOpen, onClose, isSubmitting])

  const handleDelete = () => {
    if (assignment?.id) {
      onConfirm(assignment.id)
    }
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-[9999] flex justify-end"
        >
          {/* Overlay interactivo optimizado para GPU */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={!isSubmitting ? onClose : undefined}
            className="absolute inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu cursor-pointer"
          />

          {/* Panel Lateral */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="relative h-full w-full max-w-[400px] border-l border-uecg-line bg-white shadow-2xl flex flex-col z-10 will-change-transform transform-gpu"
          >
            {/* HEADER GEOMÉTRICO (PELIGRO/ROJO) */}
            <div className="flex items-center justify-between border-b p-6 relative overflow-hidden bg-red-50 border-red-200 text-red-600 shrink-0">
              <div className="absolute -right-8 -top-8 w-24 h-24 border-[6px] border-current opacity-10 rounded-none rotate-45 pointer-events-none"></div>
              <div className="absolute right-12 -bottom-4 w-12 h-12 bg-current opacity-10 -rotate-12 pointer-events-none"></div>
              <div className="absolute left-1/2 bottom-0 w-8 h-2 bg-current opacity-10 pointer-events-none"></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center shadow-sm text-white font-black text-lg bg-red-600">
                  !
                </div>
                <div>
                  <span className="label-swiss !mb-0 !text-[9px] text-inherit">Carga Horaria</span>
                  <h2
                    id="delete-dialog-title"
                    className="text-xl font-black uppercase tracking-tighter mt-0.5 text-red-700"
                  >
                    Eliminar Asignación
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="p-1.5 relative z-10 hover:text-red-800 transition-colors focus:outline-none disabled:opacity-50 bg-white/50 rounded-full hover:bg-white cursor-pointer"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="border border-red-200 bg-red-50 p-6 flex flex-col items-center text-center gap-3 shadow-sm">
                  <AlertTriangle className="w-12 h-12 text-red-600" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-red-600">
                      ¿QUITAR DOCENTE?
                    </h3>
                    {assignment && (
                      <div className="mt-3 flex flex-col items-center justify-center border border-red-200 bg-white px-4 py-3 shadow-sm">
                        <span className="text-xs font-black text-red-900 uppercase tracking-widest leading-none">
                          {assignment.teacher.fullName}
                        </span>
                        <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest mt-1.5 pt-1.5 border-t border-red-100 w-full">
                          de {assignment.subject.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-red-700/80 uppercase tracking-widest leading-relaxed mt-2">
                    Al quitar a este docente, la materia quedará sin profesor asignado en este curso.
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER BUTTONS GEOMÉTRICOS */}
            <div className="p-5 border-t border-uecg-line bg-gray-50 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-uecg-line text-uecg-gray hover:bg-white shadow-sm disabled:opacity-50 outline-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 py-3 font-black uppercase tracking-widest text-[11px] bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm outline-none cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Quitar Docente
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default DeleteAssignmentDrawer
