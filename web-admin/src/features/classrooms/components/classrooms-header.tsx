import { Plus, Layers, Loader2, Landmark } from 'lucide-react'
import { PageHeader, PageHeaderButton } from '@/shared/ui/page-header'

interface ClassroomsHeaderProps {
  canManageClassrooms: boolean
  currentYearName?: string
  onOpenCreate: () => void
  onOpenBulkCreate: () => void
  isPending?: boolean
  isFetching?: boolean
}

export const ClassroomsHeader = ({
  canManageClassrooms,
  currentYearName,
  onOpenCreate,
  onOpenBulkCreate,
  isPending = false,
  isFetching = false,
}: ClassroomsHeaderProps) => {
  return (
    <div className="relative w-full">
      {/* Indicador de carga asíncrona en segundo plano */}
      {isFetching && !isPending && (
        <div className="absolute top-0 right-0 flex items-center gap-2 text-uecg-blue text-[10px] font-bold uppercase tracking-widest bg-blue-50 px-3 py-1.5 animate-pulse rounded-sm z-20 border border-blue-100 shadow-sm">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Actualizando...
        </div>
      )}

      <PageHeader
        breadcrumbs={[
          { label: 'ADMINISTRACIÓN' },
          { label: currentYearName ? `GESTIÓN ${currentYearName}` : 'GESTIÓN ACADÉMICA', href: '/academic-years' },
          { label: 'AULAS Y CURSOS', icon: Landmark },
        ]}
        title="Aulas y Cursos"
        description="Organización de niveles, turnos, grados y paralelos institucionales."
      >
        {canManageClassrooms && (
          <>
            <PageHeaderButton
              id="btn-bulk-classrooms"
              data-tour="btn-bulk-classrooms"
              onClick={onOpenBulkCreate}
              icon={Layers}
              variant="secondary"
            >
              Creación Masiva
            </PageHeaderButton>
            <PageHeaderButton
              id="btn-new-classroom"
              data-tour="btn-new-classroom"
              onClick={onOpenCreate}
              icon={Plus}
              variant="dark"
              hotkey="N"
            >
              Nueva Aula
            </PageHeaderButton>
          </>
        )}
      </PageHeader>
    </div>
  )
}
