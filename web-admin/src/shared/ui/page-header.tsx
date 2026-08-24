import React from 'react'
import { Loader2, type LucideIcon } from 'lucide-react'

export interface PageHeaderProps {
  /** Texto o elemento superior pequeño (Kicker / Tag) */
  kicker?: React.ReactNode
  /** Icono opcional para acompañar el kicker */
  kickerIcon?: LucideIcon
  /** Título principal de la vista en tipografía Swiss Brutalist */
  title: React.ReactNode
  /** Subtítulo o descripción opcional */
  description?: React.ReactNode
  /** Botones de acción o controles contextuales a la derecha */
  children?: React.ReactNode
  /** Clases adicionales para el contenedor */
  className?: string
}

/**
 * Cabecera unificada estándar para las vistas del web-admin (Swiss Brutalism).
 * Basada en la arquitectura visual de la Matriz de Horarios (Timetables).
 */
export function PageHeader({
  kicker,
  kickerIcon: KickerIcon,
  title,
  description,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <header
      className={`flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-uecg-line pb-6 mt-4 relative overflow-hidden ${className}`}
    >
      <div className="relative z-10">
        {kicker && (
          <span className="text-[10px] font-black uppercase tracking-widest text-uecg-blue flex items-center gap-2">
            {KickerIcon && <KickerIcon className="w-3.5 h-3.5" aria-hidden="true" />}
            {kicker}
          </span>
        )}
        <h1 className="text-4xl mt-1.5 font-black tracking-tighter uppercase text-uecg-dark leading-none">
          {title}
        </h1>
        {description && (
          <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest mt-2">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {children}
        </div>
      )}
    </header>
  )
}

export interface PageHeaderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'dark' | 'primary' | 'secondary' | 'danger'
  icon?: LucideIcon
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
}

/**
 * Botón de acción estandarizado para las cabeceras de página.
 * Replica el diseño y comportamiento del botón de exportación de Timetables.
 */
export function PageHeaderButton({
  variant = 'dark',
  icon: Icon,
  isLoading = false,
  loadingText,
  children,
  disabled,
  className = '',
  ...props
}: PageHeaderButtonProps) {
  const getVariantStyles = () => {
    if (isLoading) {
      return 'bg-gray-100 text-uecg-gray border border-uecg-line cursor-wait'
    }

    switch (variant) {
      case 'primary':
        return 'bg-uecg-blue text-white hover:bg-uecg-dark border-none'
      case 'secondary':
        return 'bg-white border border-uecg-line text-uecg-dark hover:bg-gray-50'
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 border-none'
      case 'dark':
      default:
        return 'bg-uecg-dark text-white hover:bg-uecg-blue border-none'
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`px-6 py-4 font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-sm transition-all cursor-pointer outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      ) : null}
      <span>{isLoading && loadingText ? loadingText : children}</span>
    </button>
  )
}
