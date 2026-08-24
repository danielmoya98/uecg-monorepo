import { BookMarked, Plus, Loader2 } from 'lucide-react'
import { PageHeader, PageHeaderButton } from '@/shared/ui/page-header'

interface SubjectsHeaderProps {
  canManageSubjects: boolean
  onOpenCreate: () => void
  isFetching?: boolean
  isPending?: boolean
}

export const SubjectsHeader = ({
  canManageSubjects,
  onOpenCreate,
  isFetching = false,
  isPending = false,
}: SubjectsHeaderProps) => {
  return (
    <div className="relative w-full">
      {isFetching && !isPending && (
        <div className="absolute top-0 right-0 flex items-center gap-2 text-uecg-blue text-[10px] font-bold uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1.5 animate-pulse z-20 shadow-sm">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Actualizando Catálogo...
        </div>
      )}

      <PageHeader
        kicker="CATÁLOGO GENERAL"
        kickerIcon={BookMarked}
        title="Materias y Asignaturas"
      >
        {canManageSubjects && (
          <PageHeaderButton
            id="btn-new-subject"
            data-tour="btn-new-subject"
            onClick={onOpenCreate}
            icon={Plus}
            variant="dark"
          >
            Nueva Materia
          </PageHeaderButton>
        )}
      </PageHeader>
    </div>
  )
}

