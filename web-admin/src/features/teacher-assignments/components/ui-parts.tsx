import { AlertTriangle, CalendarRange, Copy } from 'lucide-react'
import { PageHeader, PageHeaderButton } from '@/shared/ui/page-header'

interface HeaderProps {
  year: number | string
  canManage: boolean
  onOpenClone?: () => void
  isCloneDisabled?: boolean
}

export const AssignmentsHeader = ({
  year,
  canManage,
  onOpenClone,
  isCloneDisabled = false,
}: HeaderProps) => {
  return (
    <PageHeader
      kicker={`GESTIÓN ${year}`}
      kickerIcon={CalendarRange}
      title="Carga Horaria"
      description="Asignación de materias y plantel docente para la gestión escolar."
    >
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest border ${
            canManage
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-yellow-50 border-yellow-200 text-yellow-700'
          }`}
        >
          {canManage ? 'Modo Editor' : 'Modo Lector'}
        </span>

        {canManage && onOpenClone && (
          <PageHeaderButton
            id="btn-clone-assignments-header"
            data-tour="btn-clone-assignments"
            onClick={onOpenClone}
            disabled={isCloneDisabled}
            icon={Copy}
            variant="dark"
          >
            Clonar Carga
          </PageHeaderButton>
        )}
      </div>
    </PageHeader>
  )
}

export const NoActiveYearAlert = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-yellow-200 bg-yellow-50/50 shadow-sm max-w-2xl mx-auto my-12 animate-in zoom-in-95">
      <AlertTriangle className="w-16 h-16 text-yellow-600 mb-4" strokeWidth={1.5} />
      <h2 className="text-lg font-black uppercase tracking-widest text-yellow-900">
        Sin Gestión Activa
      </h2>
      <p className="text-[11px] font-bold text-yellow-700 uppercase tracking-widest mt-3 max-w-md leading-relaxed">
        No se ha detectado ninguna gestión escolar en estado "ACTIVO". Configure y active un año académico en el panel de Gestión Académica para poder administrar la carga horaria.
      </p>
    </div>
  )
}
