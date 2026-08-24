import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { AlertTriangle, LayoutGrid, Download } from 'lucide-react'




import { PageHeader, PageHeaderButton } from '@/shared/ui/page-header'
import { AcademicYearsService } from '@/features/academic-years/api/academic-years.service'
import { ClassroomsService } from '@/features/classrooms/api/classrooms.service'
import type { Classroom } from '@/features/classrooms/types/classrooms.types'

import { useTimetableExport } from '../hooks/use-timetable-export'
import { ClassroomsSkeleton } from './classrooms-skeleton'
import { ClassroomCard } from './classroom-card'
import { ClassroomScheduleDrawer } from './classroom-schedule-drawer'

export function TimetablesPage() {
  // 1. Obtención de permisos síncronos desde el contexto del enrutador de TanStack Router
  const { can } = useRouteContext({ from: '/_authenticated' })
  const canManageTimetables = can('manage:all', 'Timetable') || can('manage:all', 'all')

  // 2. Estado local
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)

  // 3. Consulta del Año Académico Activo
  const { data: currentYear, isLoading: isLoadingYear } = useQuery({
    queryKey: ['currentAcademicYear'],
    queryFn: AcademicYearsService.getCurrent,
  })

  // 4. Consulta de Aulas de la gestión escolar activa
  const { data: classroomsData, isLoading: isLoadingClassrooms } = useQuery({
    queryKey: ['classrooms_planning', currentYear?.id],
    queryFn: () => ClassroomsService.getAll(1, 100, '', currentYear?.id),
    enabled: !!currentYear?.id,
  })

  const classrooms = classroomsData?.data || []

  // 5. Hook de exportaciones y descargas
  const { isExporting, handleStartExport } = useTimetableExport(currentYear?.id)

  // 6. Visualización de Cargando Gestión Escolar
  if (isLoadingYear) {
    return (
      <div className="flex flex-col gap-6 w-full pb-20 animate-in fade-in duration-300">
        <PageHeader
          kicker="HORARIOS Y ASIGNACIÓN DE AULAS"
          kickerIcon={LayoutGrid}
          title="Planificación Horaria"
          description="Diseño de bloques pedagógicos y control de colisiones docentes."
        />
        <ClassroomsSkeleton />
      </div>
    )
  }

  // 7. Visualización de Módulo Bloqueado si no hay año escolar activo
  if (!currentYear) {
    return (
      <div
        className="border-l-8 border-l-red-600 bg-red-50 p-8 text-left max-w-3xl mx-auto mt-10 shadow-sm animate-in fade-in zoom-in-95"
        role="alert"
      >
        <AlertTriangle className="w-8 h-8 text-red-600 mb-4" />
        <h2 className="text-xl font-black uppercase tracking-tighter text-uecg-dark">
          Módulo Bloqueado
        </h2>
        <p className="text-[11px] font-bold text-uecg-gray mt-2 uppercase tracking-widest leading-relaxed">
          Debe crear o activar una Gestión Académica (Año Escolar) antes de visualizar la matriz de
          horarios.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-20 animate-in fade-in duration-300">

      <PageHeader
        kicker={`GESTIÓN ${currentYear.year}`}
        kickerIcon={LayoutGrid}
        title="Matriz de Horarios"
      >
        {canManageTimetables && (
          <PageHeaderButton
            id="btn-export-timetables"
            data-tour="btn-export-timetables"
            onClick={handleStartExport}
            disabled={classrooms.length === 0}
            isLoading={isExporting}
            loadingText="Empaquetando ZIP..."
            icon={Download}
            variant="dark"
          >
            Exportar Lote Maestro
          </PageHeaderButton>
        )}
      </PageHeader>

      {/* Listado Principal de Aulas */}
      {isLoadingClassrooms ? (
        <ClassroomsSkeleton />
      ) : classrooms.length === 0 ? (
        <div className="border border-dashed border-uecg-line p-20 flex flex-col items-center justify-center text-center bg-gray-50/50">
          <div
            className="w-16 h-16 border-4 border-gray-300 rounded-none rotate-45 mb-6"
            aria-hidden="true"
          />
          <p className="text-xs uppercase font-black tracking-widest text-uecg-gray">
            No hay aulas registradas en la gestión académica.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          role="region"
          aria-label="Listado de aulas"
        >
          {classrooms.map((c: Classroom) => (
            <ClassroomCard
              key={c.id}
              classroom={c}
              onClick={setSelectedClassroom}
              canManage={canManageTimetables}
            />
          ))}
        </div>
      )}

      {/* Drawer Lateral del Horario */}
      {selectedClassroom && (
        <ClassroomScheduleDrawer
          classroom={selectedClassroom}
          onClose={() => setSelectedClassroom(null)}
          canManage={canManageTimetables}
        />
      )}
    </div>
  )
}
export default TimetablesPage
