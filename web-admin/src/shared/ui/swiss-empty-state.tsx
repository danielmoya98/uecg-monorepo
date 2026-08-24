import React from 'react'
import { FileText, type LucideIcon } from 'lucide-react'

export interface SwissEmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  actionButton?: React.ReactNode
  className?: string
}

export function SwissEmptyState({
  icon: Icon = FileText,
  title = 'Búsqueda sin resultados',
  description = 'No se encontraron registros para los filtros actuales.',
  actionButton,
  className = '',
}: SwissEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-20 px-6 text-center opacity-80 animate-in fade-in zoom-in-95 duration-200 select-none ${className}`}
    >
      {/* Composición Abstracta Bauhaus en Marca de Agua */}
      <div className="relative w-24 h-24 mb-6 pointer-events-none">
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-uecg-line rounded-none rotate-12" />
        <div className="absolute bottom-0 right-0 w-12 h-12 bg-gray-100 -rotate-12" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 shadow-sm border border-uecg-line">
          <Icon className="w-6 h-6 text-uecg-gray" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="font-black uppercase tracking-widest text-xs text-uecg-dark mb-1">
        {title}
      </h3>
      <p className="text-[10px] font-bold uppercase tracking-widest text-uecg-gray max-w-sm">
        {description}
      </p>

      {actionButton && <div className="mt-5">{actionButton}</div>}
    </div>
  )
}
export default SwissEmptyState
