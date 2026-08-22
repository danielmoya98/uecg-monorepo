import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ClassroomsPaginationProps {
  page: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

export const ClassroomsPagination = ({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: ClassroomsPaginationProps) => {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between border-t border-uecg-line pt-4 mt-6 text-uecg-gray text-[10px] font-bold uppercase tracking-widest select-none">
        <span>Mostrando {totalItems} registros en total</span>
        <span>Página 1 de 1</span>
      </div>
    )
  }

  const startRange = (page - 1) * 10 + 1
  const endRange = Math.min(page * 10, totalItems)

  return (
    <nav
      aria-label="Paginación de aulas"
      className="flex flex-col sm:flex-row items-center justify-between border-t border-uecg-line pt-4 mt-6 gap-4 select-none"
    >
      <span className="text-uecg-gray text-[10px] font-bold uppercase tracking-widest">
        Mostrando <span className="font-black text-uecg-dark">{startRange}-{endRange}</span> de{' '}
        <span className="font-black text-uecg-dark">{totalItems}</span> aulas registradas
      </span>

      <div className="flex border border-uecg-line bg-white shadow-sm overflow-hidden shrink-0">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="px-4 py-2.5 flex items-center justify-center transition-colors border-r border-uecg-line text-uecg-gray hover:text-uecg-dark hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-uecg-gray cursor-pointer outline-none focus:ring-1 focus:ring-uecg-dark"
          aria-label="Ir a la página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-5 py-2.5 text-[10px] font-black text-uecg-dark uppercase tracking-widest bg-gray-50 flex items-center justify-center min-w-[120px]">
          Pág. {page} de {totalPages}
        </span>

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-4 py-2.5 flex items-center justify-center transition-colors text-uecg-gray hover:text-uecg-dark hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-uecg-gray cursor-pointer outline-none focus:ring-1 focus:ring-uecg-dark"
          aria-label="Ir a la página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  )
}
export default ClassroomsPagination
