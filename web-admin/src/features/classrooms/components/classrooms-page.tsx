import { useRouteContext } from '@tanstack/react-router'
import { ShieldAlert } from 'lucide-react'

// Hooks Co-localizados
import { useClassroomsData } from '../hooks/use-classrooms-data'

// Componentes Presentacionales
import { ClassroomsHeader } from './classrooms-header'
import { ClassroomsFilters } from './classrooms-filters'
import { ClassroomsTable } from './classrooms-table'
import { ClassroomsGrid } from './classrooms-grid'
import { ClassroomsPagination } from './classrooms-pagination'
import { ClassroomDrawer } from './classroom-drawer'
import { BulkClassroomDrawer } from './bulk-classroom-drawer'

export default function ClassroomsPage() {
  // 1. Inteligencia de Seguridad ABAC (Doble Escudo)
  const { can } = useRouteContext({ from: '/_authenticated' })
  const canManageClassrooms = can('manage:all', 'Classroom')

  // 2. Consumir el Hook Centralizado Co-localizado
  const {
    // Paginación y Filtros
    page,
    setPage,
    searchTerm,
    setSearchTerm,
    selectedLevel,
    setSelectedLevel,
    selectedShift,
    setSelectedShift,
    viewMode,
    setViewMode,

    // Cajones (Drawers)
    isDrawerOpen,
    drawerMode,
    selectedClassroom,
    handleAction,
    closeDrawer,
    isBulkDrawerOpen,
    openBulkDrawer,
    closeBulkDrawer,

    // Datos de Servidor
    currentYear,
    institution,
    classrooms,
    meta,
    isPending,
    isFetching,
  } = useClassroomsData()

  // Alerta defensiva si no cuenta con permisos mínimos de lectura (Opcional, pero seguro)
  const canReadClassrooms = can('manage:all', 'Classroom') || can('read:all', 'Classroom')
  if (!canReadClassrooms) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-red-200 bg-red-50/50 shadow-sm w-full min-h-[400px]">
        <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mb-5 animate-pulse">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-red-800 mb-2">
          Acceso Restringido
        </h3>
        <p className="text-xs text-red-700 font-bold uppercase tracking-widest max-w-md leading-relaxed">
          Tu cuenta no cuenta con las facultades operativas suficientes para listar o gestionar las aulas del colegio.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full relative animate-in fade-in duration-300 min-h-[calc(100vh-140px)] justify-between pb-8">
      <div className="flex flex-col gap-6 w-full relative">

        {/* Cabecera Brutalista de Aulas */}
        <ClassroomsHeader
          canManageClassrooms={canManageClassrooms}
          currentYearName={currentYear?.name}
          onOpenCreate={() => handleAction('create')}
          onOpenBulkCreate={openBulkDrawer}
          isFetching={isFetching}
          isPending={isPending}
        />

        {/* Barra de Filtros con atajo CTRL+K */}
        <ClassroomsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          level={selectedLevel}
          onLevelChange={setSelectedLevel}
          shift={selectedShift}
          onShiftChange={setSelectedShift}
          allowedLevels={institution?.levels || []}
          allowedShifts={institution?.shifts || []}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Renderizado de Vistas (Lista / Tarjetas) */}
        <div className="w-full mt-2">
          {viewMode === 'table' ? (
            <ClassroomsTable
              classrooms={classrooms}
              isPending={isPending}
              isFetching={isFetching}
              currentYearExists={!!currentYear}
              onAction={handleAction}
              canManage={canManageClassrooms}
            />
          ) : (
            <ClassroomsGrid
              classrooms={classrooms}
              isPending={isPending}
              isFetching={isFetching}
              currentYearExists={!!currentYear}
              onAction={handleAction}
              canManage={canManageClassrooms}
            />
          )}
        </div>
      </div>

      {/* Paginación */}
      <ClassroomsPagination
        page={page}
        totalPages={meta.totalPages}
        totalItems={meta.total}
        onPageChange={setPage}
      />

      {/* Cajón de Aulas (Crear / Editar / Eliminar) */}
      <ClassroomDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        mode={drawerMode}
        data={selectedClassroom}
        activeYearId={currentYear?.id}
      />

      {/* Cajón de Creación Masiva */}
      <BulkClassroomDrawer
        isOpen={isBulkDrawerOpen}
        onClose={closeBulkDrawer}
        activeYearId={currentYear?.id}
      />
    </div>
  )
}
