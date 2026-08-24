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

export const TeacherAssignmentsSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      <PageHeader

        kicker="GESTIÓN ESCOLAR"
        kickerIcon={CalendarRange}
        title="Carga Horaria"
        description="Asignación de materias y plantel docente para la gestión escolar."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[60vh] pb-20 animate-pulse">
        {/* Columna Izquierda: Selector de Cursos Skeleton */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="border border-uecg-line bg-white p-4 shadow-sm flex flex-col gap-3">
            <div className="h-4 w-32 bg-gray-200" />
            <div className="h-9 bg-gray-100 border border-uecg-line" />
            <div className="flex flex-col gap-2 mt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`sk-cls-${i}`} className="p-3 border border-uecg-line bg-gray-50 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-28 bg-gray-200" />
                    <div className="h-3 w-14 bg-gray-200" />
                  </div>
                  <div className="h-2.5 w-20 bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Panel de Asignación Skeleton */}
        <div className="lg:col-span-8 flex flex-col border border-uecg-line bg-white shadow-sm min-h-[500px]">
          {/* Header Ticket */}
          <div className="bg-uecg-dark p-6 md:p-8 flex flex-col gap-3">
            <div className="h-3 w-28 bg-white/20" />
            <div className="h-8 w-48 bg-white/20" />
            <div className="h-3 w-36 bg-white/10 mt-1" />
          </div>

          {/* Form */}
          <div className="bg-gray-50 border-b border-uecg-line p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 flex flex-col gap-2">
              <div className="h-2.5 w-16 bg-gray-200" />
              <div className="h-10 bg-gray-200 border border-uecg-line" />
            </div>
            <div className="md:col-span-5 flex flex-col gap-2">
              <div className="h-2.5 w-16 bg-gray-200" />
              <div className="h-10 bg-gray-200 border border-uecg-line" />
            </div>
            <div className="md:col-span-3 flex flex-col justify-end">
              <div className="h-10 bg-gray-200" />
            </div>
          </div>

          {/* Tabla Skeleton */}
          <div className="p-4 flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`sk-tbl-${i}`} className="flex justify-between items-center py-3 border-b border-uecg-line">
                <div className="h-4 w-40 bg-gray-200" />
                <div className="h-3 w-48 bg-gray-100" />
                <div className="h-4 w-12 bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
