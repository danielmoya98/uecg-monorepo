import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { DrawerMode } from '../hooks/use-subjects-data'
import type { Subject } from '../types/subjects.types'
import SubjectActionConfirm from './subject-action-confirm'
import SubjectForm from './subject-form'

interface SubjectDrawerProps {
  isOpen: boolean
  onClose: () => void
  mode: DrawerMode
  subjectData?: Subject | null
  allowedLevels: string[]
  createMutation: any
  updateMutation: any
  deleteMutation: any
}

export default function SubjectDrawer({
  isOpen,
  onClose,
  mode,
  subjectData,
  allowedLevels,
  createMutation,
  updateMutation,
  deleteMutation,
}: SubjectDrawerProps) {
  // Manejador del teclado para cerrar con ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleFormSubmit = (formData: any) => {
    if (mode === 'create') {
      createMutation.mutate(formData)
    } else if (mode === 'edit' && subjectData?.id) {
      updateMutation.mutate({ id: subjectData.id, data: formData })
    }
  }

  const handleDeleteConfirm = () => {
    if (subjectData?.id) {
      deleteMutation.mutate(subjectData.id)
    }
  }

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const titles = {
    create: 'Nueva Materia',
    edit: 'Editar Materia',
    delete: 'Eliminar Materia',
  }

  const headerClasses =
    mode === 'delete'
      ? 'bg-red-50 border-red-200 text-red-600'
      : 'bg-gray-50 border-uecg-line text-uecg-gray'

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          {/* Fondo interactivo optimizado para GPU */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu cursor-pointer"
            onClick={!isSubmitting ? onClose : undefined}
          />

          {/* Cajón Brutalista Suizo */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="relative h-full w-full max-w-[400px] border-l border-uecg-line bg-white shadow-2xl flex flex-col z-10 will-change-transform transform-gpu"
          >
            {/* Header Geométrico Dinámico */}
            <div
              className={`flex items-center justify-between border-b p-6 relative overflow-hidden shrink-0 ${headerClasses}`}
            >
              {/* Figuras Abstractas Estilo Bauhaus */}
              <div className="absolute -right-8 -top-8 w-24 h-24 border-[6px] border-current opacity-10 rounded-none rotate-45 pointer-events-none" />
              <div className="absolute right-12 -bottom-4 w-12 h-12 bg-current opacity-10 -rotate-12 pointer-events-none" />
              <div className="absolute left-1/2 bottom-0 w-8 h-2 bg-current opacity-10 pointer-events-none" />

              <div className="relative z-10 flex items-center gap-4">
                <div
                  className={`w-10 h-10 flex items-center justify-center shadow-sm text-white font-black text-xl ${
                    mode === 'delete' ? 'bg-red-600' : 'bg-uecg-blue'
                  }`}
                >
                  {mode === 'delete' ? '!' : subjectData?.name?.charAt(0).toUpperCase() || '+'}
                </div>
                <div>
                  <span className="label-swiss !mb-0 !text-[9px] text-inherit">
                    Catálogo General
                  </span>
                  <h2
                    id="drawer-title"
                    className="text-xl font-black uppercase tracking-tighter mt-0.5 text-uecg-dark"
                  >
                    {titles[mode]}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="p-1.5 relative z-10 text-uecg-gray hover:text-red-600 transition-colors focus:outline-none disabled:opacity-50 bg-white/50 rounded-full hover:bg-red-50 cursor-pointer"
                aria-label="Cerrar cajón"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenedor del Formulario / Contenido */}
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar" tabIndex={0}>
              {mode === 'delete' ? (
                <SubjectActionConfirm
                  subjectName={subjectData?.name}
                  subjectLevel={subjectData?.level}
                  onCancel={onClose}
                  onConfirm={handleDeleteConfirm}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <SubjectForm
                  mode={mode}
                  isOpen={isOpen}
                  initialData={subjectData}
                  allowedLevels={allowedLevels}
                  onSubmit={handleFormSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
