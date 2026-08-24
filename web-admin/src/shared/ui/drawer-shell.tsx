import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export interface DrawerShellProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  kicker?: string
  header?: React.ReactNode
  headerVariant?: 'default' | 'danger' | 'success' | 'warning' | 'dark' | 'custom'
  maxWidth?: string
  isSubmitting?: boolean
  showCloseButton?: boolean
  className?: string
  overlayClassName?: string
}

export function DrawerShell({
  isOpen,
  onClose,
  children,
  title,
  kicker,
  header,
  headerVariant = 'default',
  maxWidth = 'max-w-[460px]',
  isSubmitting = false,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
}: DrawerShellProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isSubmitting, onClose])

  if (typeof document === 'undefined') return null

  const headerVariantClasses = {
    default: 'bg-gray-50 border-b border-uecg-line text-uecg-dark',
    dark: 'bg-uecg-dark border-b border-uecg-dark text-white',
    danger: 'bg-red-50 border-b border-red-200 text-red-700',
    success: 'bg-green-50 border-b border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-b border-yellow-200 text-yellow-800',
    custom: '',
  }[headerVariant]

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex justify-end overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay suizo optimizado para GPU sin backdrop-blur costoso */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`absolute inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu cursor-pointer ${overlayClassName}`}
            onClick={!isSubmitting ? onClose : undefined}
          />

          {/* Panel Lateral Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className={`relative h-full w-full ${maxWidth} border-l border-uecg-line bg-white shadow-2xl flex flex-col z-10 will-change-transform transform-gpu ${className}`}
          >
            {/* Header del Drawer */}
            {header !== undefined ? (
              header
            ) : title || kicker ? (
              <div className={`p-6 relative overflow-hidden flex items-start justify-between ${headerVariantClasses}`}>
                {/* Elementos geométricos sutiles Swiss/Bauhaus */}
                <div className="absolute -right-8 -top-8 w-24 h-24 border-[6px] border-current opacity-5 rounded-full pointer-events-none" />
                <div className="absolute right-14 -bottom-4 w-12 h-12 bg-current opacity-5 rotate-45 pointer-events-none" />

                <div className="relative z-10 pr-6">
                  {kicker && (
                    <span className="label-swiss !mb-1 !text-[9px] text-inherit opacity-80 block">
                      {kicker}
                    </span>
                  )}
                  {title && (
                    <h2 className="text-xl font-black uppercase tracking-tight text-inherit leading-none mt-1">
                      {title}
                    </h2>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="relative z-10 p-2 text-inherit opacity-60 hover:opacity-100 hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer outline-none disabled:pointer-events-none"
                    aria-label="Cerrar panel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : null}

            {/* Contenido */}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
