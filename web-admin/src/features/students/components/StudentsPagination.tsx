interface StudentsPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
}

export default function StudentsPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: StudentsPaginationProps) {
  const currentTotalPages = totalPages || 1;

  return (
    <div className="flex justify-between items-center pt-2 border-t border-uecg-line">
      <span className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest">
        Mostrando página {page} de {currentTotalPages} • Total: {totalItems} estudiantes
      </span>
      <div className="flex">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1.5 border border-uecg-line text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
        >
          Anterior
        </button>
        <span className="px-3 py-1.5 bg-uecg-blue text-white border border-uecg-blue text-[10px] font-bold uppercase tracking-widest">
          {page} / {currentTotalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(currentTotalPages, page + 1))}
          disabled={page >= currentTotalPages}
          className="px-3 py-1.5 border border-uecg-line border-l-0 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
