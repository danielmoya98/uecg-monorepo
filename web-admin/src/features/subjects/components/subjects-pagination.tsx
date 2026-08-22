interface SubjectsPaginationProps {
  page: number
  totalPages: number
  totalItems: number
  onPageChange: (newPage: number) => void
}

export default function SubjectsPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: SubjectsPaginationProps) {
  const safeTotalPages = totalPages || 1
  const isFirstPage = page === 1
  const isLastPage = page >= safeTotalPages

  return (
    <nav
      aria-label="Paginación de catálogo de materias"
      className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-uecg-line bg-white mt-auto"
    >
      <span className="text-[10px] font-black text-uecg-gray uppercase tracking-widest text-center sm:text-left">
        Mostrando página {page} de {safeTotalPages} • Total: {totalItems} registros
      </span>
      <div className="flex shadow-sm">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={isFirstPage}
          aria-disabled={isFirstPage}
          aria-label="Ir a la página anterior"
          className="px-4 py-2 border border-uecg-line text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-white transition-colors outline-none focus:ring-1 focus:ring-uecg-dark"
        >
          Anterior
        </button>
        <span
          aria-current="page"
          className="px-4 py-2 bg-uecg-blue text-white border border-uecg-blue text-[10px] font-black uppercase tracking-widest select-none flex items-center justify-center min-w-[70px]"
        >
          {page} / {safeTotalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
          disabled={isLastPage}
          aria-disabled={isLastPage}
          aria-label="Ir a la página siguiente"
          className="px-4 py-2 border border-uecg-line border-l-0 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-white transition-colors outline-none focus:ring-1 focus:ring-uecg-dark"
        >
          Siguiente
        </button>
      </div>
    </nav>
  )
}
