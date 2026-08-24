import { SwissKbd } from './swiss-kbd'

export interface SwissPaginationProps {
  page: number
  totalPages: number
  totalItems?: number
  itemLabel?: string
  onPageChange: (newPage: number) => void
  className?: string
}

export function SwissPagination({
  page,
  totalPages,
  totalItems,
  itemLabel = 'registros',
  onPageChange,
  className = '',
}: SwissPaginationProps) {
  const currentTotalPages = Math.max(1, totalPages || 1)

  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-uecg-line ${className}`}
    >
      <span className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest text-center sm:text-left">
        Mostrando página {page} de {currentTotalPages}
        {totalItems !== undefined && ` • Total: ${totalItems} ${itemLabel}`}
      </span>
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 border border-uecg-line bg-white text-[10px] font-bold uppercase tracking-widest text-uecg-text hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <SwissKbd className="text-[8px] px-1 py-0 opacity-60">←</SwissKbd>
          <span>Anterior</span>
        </button>
        <span className="px-3 py-1.5 bg-uecg-blue text-white border border-uecg-blue text-[10px] font-bold uppercase tracking-widest select-none flex items-center justify-center min-w-[60px]">
          {page} / {currentTotalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentTotalPages, page + 1))}
          disabled={page >= currentTotalPages}
          className="px-3 py-1.5 border border-uecg-line border-l-0 bg-white text-[10px] font-bold uppercase tracking-widest text-uecg-text hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>Siguiente</span>
          <SwissKbd className="text-[8px] px-1 py-0 opacity-60">→</SwissKbd>
        </button>
      </div>
    </div>
  )
}
export default SwissPagination
