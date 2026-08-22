

interface EnrollmentsPaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (newPage: number) => void;
}

export default function EnrollmentsPagination({
    page,
    totalPages,
    totalItems,
    onPageChange,
}: EnrollmentsPaginationProps) {
    return (
        <div className="flex justify-between items-center pt-2 border-t border-uecg-line">
            <span className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest">
                Mostrando página {page} de {totalPages || 1} • Total: {totalItems} solicitudes
            </span>
            <div className="flex">
                <button
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 border border-uecg-line text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 disabled:opacity-50"
                >
                    Anterior
                </button>
                <span className="px-3 py-1.5 bg-uecg-blue text-white border border-uecg-blue text-[10px] font-bold uppercase tracking-widest">
                    {page} / {totalPages || 1}
                </span>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 border border-uecg-line border-l-0 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
