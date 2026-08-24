import React from 'react'
import { Link } from '@tanstack/react-router'
import { Loader2, ChevronRight, type LucideIcon } from 'lucide-react'
import { SwissKbd } from './swiss-kbd'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: LucideIcon
}

export interface PageHeaderProps {
  /** Migas de pan interactivas */
  breadcrumbs?: BreadcrumbItem[]
  /** Texto o elemento superior pequeño (Kicker / Tag) si no se usan breadcrumbs */
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
 * Soporta Breadcrumbs interactivos y Kicker clásico con soporte de atajos.
 */
export function PageHeader({
  breadcrumbs,
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
      <div className="relative z-10 flex flex-col gap-1.5">
        {/* BREADCRUMBS SUIZOS O KICKER */}
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              const ItemIcon = item.icon

              return (
                <React.Fragment key={`bc-${index}`}>
                  {index > 0 && (
                    <ChevronRight
                      className="w-3 h-3 text-gray-400 dark:text-zinc-600 shrink-0 select-none"
                      aria-hidden="true"
                    />
                  )}
                  {item.href && !isLast ? (
                    <Link
                      to={item.href}
                      className="text-[10px] font-black uppercase tracking-widest text-uecg-gray hover:text-uecg-blue dark:text-zinc-400 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {ItemIcon && <ItemIcon className="w-3 h-3 text-uecg-blue" />}
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                        isLast ? 'text-uecg-blue dark:text-blue-400' : 'text-uecg-gray dark:text-zinc-400'
                      }`}
                    >
                      {ItemIcon && <ItemIcon className="w-3 h-3 text-uecg-blue" />}
                      {item.label}
                    </span>
                  )}
                </React.Fragment>
              )
            })}
          </nav>
        ) : kicker ? (
          <span className="text-[10px] font-black uppercase tracking-widest text-uecg-blue dark:text-blue-400 flex items-center gap-2">
            {KickerIcon && <KickerIcon className="w-3.5 h-3.5" aria-hidden="true" />}
            {kicker}
          </span>
        ) : null}

        <h1 className="text-4xl mt-0.5 font-black tracking-tighter uppercase text-uecg-dark dark:text-zinc-100 leading-none">
          {title}
        </h1>

        {description && (
          <p className="text-[10px] font-bold text-uecg-gray dark:text-zinc-400 uppercase tracking-widest mt-1.5">
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
  hotkey?: string
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
}

/**
 * Botón de acción estandarizado para las cabeceras de página con soporte de hotkeys.
 */
export function PageHeaderButton({
  variant = 'dark',
  icon: Icon,
  hotkey,
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
        return 'bg-white border border-uecg-line text-uecg-dark hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100'
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
      {hotkey && !isLoading && (
        <SwissKbd className="ml-1 opacity-80 border-white/20 bg-white/20 text-white">
          {hotkey}
        </SwissKbd>
      )}
    </button>
  )
}
export default PageHeader
