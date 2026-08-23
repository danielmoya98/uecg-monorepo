import { Plus, Layers, Loader2, Landmark } from 'lucide-react'

interface ClassroomsHeaderProps {
  canManageClassrooms: boolean
  currentYearName?: string
  onOpenCreate: () => void
  onOpenBulkCreate: () => void
  isPending: boolean
  isFetching: boolean
}

export const ClassroomsHeader = ({
  canManageClassrooms,
  currentYearName,
  onOpenCreate,
  onOpenBulkCreate,
  isPending,
  isFetching,
}: ClassroomsHeaderProps) => {
  return (
    <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-uecg-line pb-4 mt-2 w-full">
      {/* Indicador de carga asíncrona en segundo plano */}
      {isFetching && !isPending && (
        <div className="absolute top-0 right-0 flex items-center gap-2 text-uecg-blue text-[10px] font-bold uppercase tracking-widest bg-blue-50 px-3 py-1.5 animate-pulse rounded-sm z-10 border border-blue-100 shadow-sm">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Actualizando...
        </div>
      )}

      <div>
        <span className="label-swiss !text-[10px]">Estructura Escolar</span>
        <h1 className="text-4xl mt-1 font-black tracking-tighter uppercase text-uecg-dark flex items-center gap-3">
          <Landmark className="w-8 h-8 text-uecg-blue shrink-0" />
          Aulas y Cursos
        </h1>
        {currentYearName && (
          <p className="text-[10px] font-bold text-uecg-blue uppercase tracking-widest mt-1 border border-blue-100 bg-blue-50/30 px-3 py-1 inline-block">
            Gestión Activa: <span className="font-black text-uecg-dark">{currentYearName}</span>
          </p>
        )}
      </div>

      {canManageClassrooms && (
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            id="btn-bulk-classrooms"
            data-tour="btn-bulk-classrooms"
            onClick={onOpenBulkCreate}
            className="px-5 py-3.5 font-bold uppercase tracking-widest text-[10px] border border-uecg-line text-uecg-text hover:bg-gray-50 hover:text-uecg-dark transition-all flex items-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.15)] cursor-pointer outline-none focus:ring-2 focus:ring-uecg-line"
          >
            <Layers className="w-4 h-4" /> Creación Masiva
          </button>
          <button
            type="button"
            id="btn-new-classroom"
            data-tour="btn-new-classroom"
            onClick={onOpenCreate}
            className="px-5 py-3.5 font-black uppercase tracking-widest text-[10px] bg-uecg-blue text-white hover:bg-uecg-dark transition-all flex items-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,0.15)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.35)] cursor-pointer outline-none focus:ring-2 focus:ring-uecg-blue"
          >
            <Plus className="w-4 h-4" /> Nueva Aula
          </button>
        </div>
      )}
    </header>
  )
}
