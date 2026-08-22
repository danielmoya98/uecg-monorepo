import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Loader2, AlertTriangle, Download, LayoutGrid } from 'lucide-react'

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
      <div
        className="flex h-[50vh] items-center justify-center"
        role="progressbar"
        aria-label="Cargando año escolar..."
      >
        <Loader2 className="w-10 h-10 animate-spin text-uecg-blue" />
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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-uecg-line pb-6 mt-4 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-uecg-blue flex items-center gap-2">
            <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" /> GESTIÓN {currentYear.year}
          </span>
          <h1 className="text-4xl mt-1.5 font-black tracking-tighter uppercase text-uecg-dark leading-none">
            Matriz de Horarios
          </h1>
        </div>

        {canManageTimetables && (
          <button
            type="button"
            onClick={handleStartExport}
            disabled={isExporting || classrooms.length === 0}
            className={`relative z-10 px-6 py-4 font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-sm transition-all cursor-pointer outline-none border-none
              ${
                isExporting
                  ? 'bg-gray-100 text-uecg-gray border border-uecg-line cursor-wait'
                  : 'bg-uecg-dark text-white hover:bg-uecg-blue'
              }
            `}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" aria-hidden="true" />
            )}
            {isExporting ? 'Empaquetando ZIP...' : 'Exportar Lote Maestro'}
          </button>
        )}
      </header>

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
