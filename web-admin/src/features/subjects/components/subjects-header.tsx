import { BookMarked, Plus, Loader2 } from 'lucide-react'

interface SubjectsHeaderProps {
  canManageSubjects: boolean
  onOpenCreate: () => void
  isFetching: boolean
  isPending: boolean
}

export const SubjectsHeader = ({
  canManageSubjects,
  onOpenCreate,
  isFetching,
  isPending,
}: SubjectsHeaderProps) => {
  return (
    <>
      {isFetching && !isPending && (
        <div className="absolute top-0 right-0 flex items-center gap-2 text-uecg-blue text-[10px] font-bold uppercase tracking-widest bg-blue-50/80 backdrop-blur-sm border border-blue-100 px-3 py-1.5 animate-pulse rounded-sm z-10 shadow-sm">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Actualizando Catálogo...
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-uecg-line pb-4 mt-2">
        <div>
          <span className="label-swiss !text-[10px]">Catálogo General</span>
          <h1 className="text-4xl mt-1 font-black tracking-tighter uppercase text-uecg-dark flex items-center gap-3">
            <BookMarked className="w-8 h-8 text-uecg-blue shrink-0" />
            Materias y Asignaturas
          </h1>
        </div>

        {canManageSubjects && (
          <button
            type="button"
            onClick={onOpenCreate}
            className="px-5 py-3.5 font-black uppercase tracking-widest text-[10px] bg-uecg-blue text-white hover:bg-uecg-dark transition-all flex items-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,0.15)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.35)] cursor-pointer outline-none focus:ring-2 focus:ring-uecg-blue"
          >
            <Plus className="w-4 h-4" /> Nueva Materia
          </button>
        )}
      </header>
    </>
  )
}
