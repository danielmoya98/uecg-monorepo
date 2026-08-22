interface AuditPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
}

export default function AuditPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: AuditPaginationProps) {
  const isFirstPage = page === 1;
  const isLastPage = page >= totalPages;

  return (
    <nav
      aria-label="Paginación de logs de auditoría"
      className="flex justify-between items-center pt-4 border-t border-uecg-line bg-[var(--color-background)] pb-4 mt-auto"
    >
      <span className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest">
        Mostrando página {page} de {totalPages || 1} • Total: {totalItems} registros
      </span>
      
      <div className="flex">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={isFirstPage}
          aria-disabled={isFirstPage}
          aria-label="Ir a la página anterior"
          className="px-4 py-2 border border-uecg-line text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Anterior
        </button>
        
        <span
          aria-current="page"
          className="px-4 py-2 bg-uecg-blue text-white border border-uecg-blue text-[10px] font-black uppercase tracking-widest"
        >
          {page} / {totalPages || 1}
        </span>
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={isLastPage}
          aria-disabled={isLastPage}
          aria-label="Ir a la página siguiente"
          className="px-4 py-2 border border-uecg-line border-l-0 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
