import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Loader2, Trash2, X, MapPin } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { PhysicalSpace } from '../types/physical-spaces.types'

interface DeletePhysicalSpaceDrawerProps {
  isOpen: boolean
  onClose: () => void
  space: PhysicalSpace | null
  onConfirm: (id: string) => void
  isDeleting: boolean
}

export default function DeletePhysicalSpaceDrawer({
  isOpen,
  onClose,
  space,
  onConfirm,
  isDeleting,
}: DeletePhysicalSpaceDrawerProps) {
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

    // Enfocar botón Cancelar por seguridad
    setTimeout(() => {
      const cancelButton = drawerRef.current?.querySelector('button[type="button"]') as HTMLElement
      cancelButton?.focus()
    }, 150)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [isOpen, onClose, isDeleting])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Overlay interactivo optimizado para GPU */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={!isDeleting ? onClose : undefined}
            className="absolute inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu cursor-pointer"
          />

          {/* Panel Lateral Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="relative h-full w-full max-w-[400px] border-l border-uecg-line bg-white shadow-2xl flex flex-col z-10 will-change-transform transform-gpu"
          >
            {/* HEADER GEOMÉTRICO SUIZO (ROJO) */}
            <div className="flex items-center justify-between border-b p-6 relative overflow-hidden bg-red-50 border-red-200 text-red-600 shrink-0">
              <div className="absolute -right-8 -top-8 w-24 h-24 border-[6px] border-current opacity-10 rounded-none rotate-45 pointer-events-none"></div>
              <div className="absolute right-12 -bottom-4 w-12 h-12 bg-current opacity-10 -rotate-12 pointer-events-none"></div>
              <div className="absolute left-1/2 bottom-0 w-8 h-2 bg-current opacity-10 pointer-events-none"></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center shadow-sm text-white font-black text-lg bg-red-600">
                  !
                </div>
                <div>
                  <span className="label-swiss !mb-0 !text-[9px] text-inherit">Infraestructura</span>
                  <h2 className="text-xl font-black uppercase tracking-tighter mt-0.5 text-red-700">
                    Eliminar Espacio
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="p-1.5 relative z-10 hover:text-red-800 transition-colors focus:outline-none disabled:opacity-50 bg-white/50 rounded-full hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
              <div className="border border-red-200 bg-red-50 p-6 flex flex-col items-center text-center gap-3 shadow-sm">
                <AlertTriangle className="w-12 h-12 text-red-600" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-red-600">
                    ADVERTENCIA DE SISTEMA
                  </h3>
                  <p className="text-xs font-bold text-red-900 mt-2 uppercase tracking-widest border border-red-200 bg-white px-4 py-2 inline-flex items-center gap-2 shadow-sm">
                    <MapPin className="w-3.5 h-3.5" /> {space?.name}
                  </p>
                </div>
                <p className="text-[10px] text-red-700/80 uppercase tracking-widest leading-relaxed mt-2">
                  Si este espacio ya está asignado a horarios o cursos activos, podría causar conflictos en la
                  planificación escolar. Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="bg-gray-50 border border-uecg-line p-4 flex flex-col gap-2">
                <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest">
                  Información Técnica:
                </span>
                <span className="text-xs font-bold text-uecg-dark uppercase tracking-widest">
                  ID: {space?.id}
                </span>
                <span className="text-xs font-bold text-uecg-dark uppercase tracking-widest">
                  Tipo: {space?.type}
                </span>
              </div>

              {/* FOOTER BUTTONS */}
              <div className="mt-auto pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-uecg-line text-uecg-gray hover:bg-gray-50 shadow-sm disabled:opacity-50 cursor-pointer bg-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => space && onConfirm(space.id)}
                  disabled={isDeleting}
                  className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 flex justify-center items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Eliminar Definitivo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
