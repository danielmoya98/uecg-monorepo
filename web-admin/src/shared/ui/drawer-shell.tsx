import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export type DrawerHeaderVariant = 'default' | 'dark' | 'danger' | 'success' | 'warning' | 'blue' | 'custom'

export interface DrawerHeaderProps {
  title: string
  kicker?: string
  icon?: React.ReactNode | string
  variant?: DrawerHeaderVariant
  onClose: () => void
  isSubmitting?: boolean
  showCloseButton?: boolean
  className?: string
}

export function DrawerHeader({
  title,
  kicker = 'GESTIÓN INSTITUCIONAL',
  icon,
  variant = 'default',
  onClose,
  isSubmitting = false,
  showCloseButton = true,
  className = '',
}: DrawerHeaderProps) {
  const variantStyles = {
    default: {
      container: 'bg-[#000060] text-white border-b border-blue-950/40 dark:bg-[#121214] dark:border-zinc-800 shadow-sm',
      iconBox: 'bg-uecg-blue dark:bg-blue-600 text-white shadow-sm',
      kickerColor: 'text-blue-300 dark:text-blue-400',
    },
    dark: {
      container: 'bg-[#000060] text-white border-b border-blue-950/40 dark:bg-[#121214] dark:border-zinc-800 shadow-sm',
      iconBox: 'bg-uecg-blue dark:bg-blue-600 text-white shadow-sm',
      kickerColor: 'text-blue-300 dark:text-blue-400',
    },
    blue: {
      container: 'bg-blue-700 text-white border-b border-blue-800 dark:bg-[#0c1322] dark:border-blue-900/60 shadow-sm',
      iconBox: 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm',
      kickerColor: 'text-blue-200 dark:text-blue-300',
    },
    danger: {
      container: 'bg-red-600 text-white border-b border-red-700 dark:bg-[#1a0c0c] dark:border-red-900/60 shadow-sm',
      iconBox: 'bg-red-700 dark:bg-red-600 text-white shadow-sm',
      kickerColor: 'text-red-200 dark:text-red-300',
    },
    success: {
      container: 'bg-emerald-700 text-white border-b border-emerald-800 dark:bg-[#0c1a12] dark:border-emerald-900/60 shadow-sm',
      iconBox: 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm',
      kickerColor: 'text-emerald-200 dark:text-emerald-300',
    },
    warning: {
      container: 'bg-amber-600 text-white border-b border-amber-700 dark:bg-[#1a1408] dark:border-amber-900/60 shadow-sm',
      iconBox: 'bg-amber-700 dark:bg-amber-600 text-white shadow-sm',
      kickerColor: 'text-amber-200 dark:text-amber-300',
    },
    custom: {
      container: '',
      iconBox: '',
      kickerColor: '',
    },
  }[variant]

  return (
    <div
      className={`flex items-center justify-between p-6 relative overflow-hidden shrink-0 select-none ${variantStyles.container} ${className}`}
    >
      {/* 📐 Patrones geométricos estilo Bauhaus en marca de agua */}
      <div
        className="absolute -right-8 -top-8 w-24 h-24 border-[6px] border-white/10 rounded-none rotate-45 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute right-12 -bottom-4 w-12 h-12 bg-white/10 -rotate-12 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 bottom-0 w-8 h-2 bg-white/10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Identidad / Título */}
      <div className="relative z-10 flex items-center gap-4">
        {icon && (
          <div
            className={`w-10 h-10 flex items-center justify-center text-lg font-black shrink-0 ${variantStyles.iconBox}`}
          >
            {typeof icon === 'string' ? icon.toUpperCase() : icon}
          </div>
        )}
        <div>
          {kicker && (
            <span
              className={`label-swiss !mb-0 !text-[9px] font-black tracking-widest uppercase block ${variantStyles.kickerColor}`}
            >
              {kicker}
            </span>
          )}
          <h2
            id="drawer-title"
            className="text-xl font-black uppercase tracking-tighter mt-0.5 text-white leading-tight"
          >
            {title}
          </h2>
        </div>
      </div>

      {/* Botón de Cierre X accesible */}
      {showCloseButton && (
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="p-1.5 relative z-10 text-white/70 hover:text-white transition-colors focus:outline-none disabled:opacity-50 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer"
          aria-label="Cerrar cajón"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export interface DrawerShellProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  kicker?: string
  icon?: React.ReactNode | string
  header?: React.ReactNode
  headerVariant?: DrawerHeaderVariant
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
  icon,
  header,
  headerVariant = 'default',
  maxWidth = 'max-w-[420px]',
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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex justify-end overflow-hidden pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          {/* Overlay suizo interactivo optimizado para GPU (Sin backdrop-blur costoso) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`absolute inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu cursor-pointer ${overlayClassName}`}
            onClick={!isSubmitting ? onClose : undefined}
          />

          {/* Panel Lateral Drawer Suizo Brutalista */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className={`relative h-full w-full ${maxWidth} border-l border-uecg-line bg-white dark:bg-[#121214] dark:border-zinc-800 text-uecg-text shadow-2xl flex flex-col z-10 will-change-transform transform-gpu ${className}`}
          >
            {/* Header del Drawer */}
            {header !== undefined ? (
              header
            ) : title ? (
              <DrawerHeader
                title={title}
                kicker={kicker}
                icon={icon}
                variant={headerVariant}
                onClose={onClose}
                isSubmitting={isSubmitting}
                showCloseButton={showCloseButton}
              />
            ) : null}

            {/* Contenedor del Cuerpo */}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
export default DrawerShell
