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
      container: 'bg-gray-50 border-b border-uecg-line text-uecg-dark dark:bg-[#18181b] dark:text-zinc-100 dark:border-zinc-800',
      iconBox: 'bg-uecg-blue text-white shadow-sm',
      kickerColor: 'text-uecg-blue dark:text-blue-400',
    },
    dark: {
      container: 'bg-uecg-dark border-b border-white/10 text-white dark:bg-[#121214] dark:border-zinc-800',
      iconBox: 'bg-uecg-blue text-white shadow-sm',
      kickerColor: 'text-blue-200 dark:text-blue-400',
    },
    blue: {
      container: 'bg-blue-50 border-b border-blue-200 text-uecg-blue dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-300',
      iconBox: 'bg-uecg-blue text-white shadow-sm',
      kickerColor: 'text-uecg-blue dark:text-blue-400',
    },
    danger: {
      container: 'bg-red-50 border-b border-red-200 text-red-600 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-400',
      iconBox: 'bg-red-600 text-white shadow-sm',
      kickerColor: 'text-red-600 dark:text-red-400',
    },
    success: {
      container: 'bg-emerald-50 border-b border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-400',
      iconBox: 'bg-emerald-600 text-white shadow-sm',
      kickerColor: 'text-emerald-700 dark:text-emerald-400',
    },
    warning: {
      container: 'bg-amber-50 border-b border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-400',
      iconBox: 'bg-amber-600 text-white shadow-sm',
      kickerColor: 'text-amber-700 dark:text-amber-400',
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
        className="absolute -right-8 -top-8 w-24 h-24 border-[6px] border-current opacity-10 rounded-none rotate-45 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute right-12 -bottom-4 w-12 h-12 bg-current opacity-10 -rotate-12 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 bottom-0 w-8 h-2 bg-current opacity-10 pointer-events-none"
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
            className="text-xl font-black uppercase tracking-tighter mt-0.5 text-inherit leading-tight"
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
          className="p-1.5 relative z-10 text-inherit/60 hover:text-inherit transition-colors focus:outline-none disabled:opacity-50 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full cursor-pointer"
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
