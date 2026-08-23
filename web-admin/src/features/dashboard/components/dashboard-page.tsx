import { useRouteContext } from '@tanstack/react-router'
import { useRootStats, useGlobalStats, useTeacherStats } from '../hooks/use-dashboard-stats'
import RootMetricsWidget from './root-metrics-widget'
import GlobalMetricsWidget from './global-metrics-widget'
import TeacherMetricsWidget from './teacher-metrics-widget'

export default function DashboardPage() {
  const { can, canAny, user } = useRouteContext({ from: '/_authenticated' })

  // Layer ABAC Dinámico extraído de la memoria central
  const showRootLayer = can('manage:all', 'User') || can('manage:all', 'Role')

  const showAdminLayer = canAny([
    { action: 'read:all', subject: 'Student' },
    { action: 'manage:all', subject: 'Institution' },
    { action: 'read:all', subject: 'Grade' },
    { action: 'manage:all', subject: 'AcademicYear' },
  ])

  const showTeacherLayer = canAny([
    { action: 'read:own', subject: 'Student' },
    { action: 'update:own', subject: 'Grade' },
    { action: 'create:own', subject: 'Attendance' },
  ])

  const { data: rootStats, isLoading: isLoadingRoot } = useRootStats({
    enabled: showRootLayer,
  })
  const { data: globalStats, isLoading: isLoadingGlobal } = useGlobalStats({
    enabled: showAdminLayer,
  })
  const { data: teacherStats, isLoading: isLoadingTeacher } = useTeacherStats({
    enabled: showTeacherLayer,
  })

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-10 transition-all duration-500">
      <header className="mb-0">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-uecg-text">
          Hola, <span className="text-uecg-blue">{user?.fullName?.split(' ')[0] || 'Usuario'}</span>
        </h1>
        <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest mt-1">
          {new Date().toLocaleDateString('es-BO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </header>

      <div className="flex flex-col gap-10">
        {showRootLayer && (
          <RootMetricsWidget stats={rootStats} isLoading={isLoadingRoot} />
        )}
        {showAdminLayer && (
          <GlobalMetricsWidget stats={globalStats} isLoading={isLoadingGlobal} />
        )}
        {showTeacherLayer && (
          <TeacherMetricsWidget stats={teacherStats} isLoading={isLoadingTeacher} />
        )}
      </div>

      {!showRootLayer && !showAdminLayer && !showTeacherLayer && (
        <div className="border-2 border-dashed border-uecg-line p-20 text-center bg-gray-50/50" role="alert">
          <p className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">
            No se detectaron paneles activos para los permisos de su credencial.
          </p>
        </div>
      )}
    </div>
  )
}
