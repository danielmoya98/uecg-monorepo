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
      className={`flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-uecg-line dark:border-zinc-800 ${className}`}
    >
      <span className="text-[10px] font-bold text-uecg-gray dark:text-zinc-400 uppercase tracking-widest text-center sm:text-left">
        Mostrando página {page} de {currentTotalPages}
        {totalItems !== undefined && ` • Total: ${totalItems} ${itemLabel}`}
      </span>
      <div className="flex shadow-sm shrink-0">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-4 py-2 border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] text-[10px] font-bold uppercase tracking-widest text-uecg-text dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Anterior
        </button>
        <span className="px-4 py-2 bg-uecg-blue text-white border border-uecg-blue dark:bg-blue-600 dark:border-blue-600 text-[10px] font-bold uppercase tracking-widest select-none flex items-center justify-center min-w-[70px]">
          {page} / {currentTotalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentTotalPages, page + 1))}
          disabled={page >= currentTotalPages}
          className="px-4 py-2 border border-uecg-line dark:border-zinc-800 border-l-0 bg-white dark:bg-[#121214] text-[10px] font-bold uppercase tracking-widest text-uecg-text dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
export default SwissPagination
