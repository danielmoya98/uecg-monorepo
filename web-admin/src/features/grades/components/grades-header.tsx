import { GraduationCap, BellDot } from 'lucide-react'
import { PageHeader, PageHeaderButton } from '@/shared/ui/page-header'

interface GradesHeaderProps {
  canManageGrades: boolean
  pendingRequestsCount: number
  onOpenRequests: () => void
}

export const GradesHeader = ({
  canManageGrades,
  pendingRequestsCount,
  onOpenRequests,
}: GradesHeaderProps) => (
  <PageHeader
    kicker={canManageGrades ? 'SUPERVISIÓN ACADÉMICA' : 'PANEL DOCENTE'}
    kickerIcon={GraduationCap}
    title="Planillas de Calificación"
    description="Registro y centralización de calificaciones trimestrales y promedios anuales."
  >
    {canManageGrades && (
      <div className="relative">
        <PageHeaderButton
          id="btn-grade-change-requests"
          data-tour="btn-grade-change-requests"
          onClick={onOpenRequests}
          icon={BellDot}
          variant="dark"
        >
          Solicitudes de Cambio
        </PageHeaderButton>
        {pendingRequestsCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white font-black text-[10px] w-6 h-6 flex items-center justify-center border-2 border-white shadow-md animate-pulse">
            {pendingRequestsCount}
          </span>
        )}
      </div>
    )}
  </PageHeader>
)

