import React from 'react'

export interface SwissTableContainerProps {
  children: React.ReactNode
  isFetching?: boolean
  isPending?: boolean
  maxHeight?: string
  className?: string
}

/**
 * Contenedor estándar de tablas con soporte nativo para Cabeceras Fijas (Sticky Headers),
 * scrollbars oscuros de precisión y estados de carga.
 */
export function SwissTableContainer({
  children,
  isFetching = false,
  isPending = false,
  maxHeight,
  className = '',
}: SwissTableContainerProps) {
  return (
    <div
      className={`border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] pb-12 shadow-sm overflow-auto custom-scrollbar relative transition-opacity duration-200 ${
        maxHeight ? maxHeight : ''
      } ${
        isFetching && !isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'
      } ${className}`}
    >
      {children}
    </div>
  )
}
export default SwissTableContainer
