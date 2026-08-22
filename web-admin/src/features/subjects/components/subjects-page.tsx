import { useRouteContext } from '@tanstack/react-router'
import { ShieldAlert, Loader2 } from 'lucide-react'
import { useSubjectsData } from '../hooks/use-subjects-data'
import { SubjectsHeader } from './subjects-header'
import SubjectsFilters from './subjects-filters'
import SubjectsTable from './subjects-table'
import SubjectsGrid from './subjects-grid'
import SubjectsPagination from './subjects-pagination'
import SubjectDrawer from './subject-drawer'

export default function SubjectsPage() {
  // 1. Doble Escudo de Seguridad ABAC (Router Context)
  const { can } = useRouteContext({ from: '/_authenticated' })
  const canManageSubjects = can('manage:all', 'Subject') || can('manage:all', 'all')
  const canReadSubjects = can('manage:all', 'Subject') || can('read:all', 'Subject') || can('manage:all', 'all')

  // 2. Consumimos el Hook Co-localizado Autónomo
  const {
    page,
    setPage,
    searchTerm,
    setSearchTerm,
    selectedLevel,
    setSelectedLevel,
    viewMode,
    setViewMode,
    allowedLevels,

    isDrawerOpen,
    drawerMode,
    selectedSubject,
    handleAction,
    closeDrawer,

    subjects,
    meta,
    isPending,
    isFetching,

    createMutation,
    updateMutation,
    deleteMutation,
  } = useSubjectsData()

  // Guard de acceso restringido en UI en caso de bypass del router
  if (!canReadSubjects) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-red-200 bg-red-50/50 shadow-sm w-full min-h-[400px]">
        <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mb-5 animate-pulse">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-red-800 mb-2">
          Acceso Restringido
        </h3>
        <p className="text-xs text-red-700 font-bold uppercase tracking-widest max-w-md leading-relaxed">
          Tu cuenta no cuenta con las facultades operativas suficientes para consultar el catálogo de materias.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl relative animate-in fade-in duration-300 w-full min-h-[calc(100vh-140px)] justify-between pb-8">
      <div className="flex flex-col gap-6 w-full relative">
        {/* Indicador de carga sutil para actualizaciones en segundo plano */}
        {isFetching && !isPending && (
          <div className="absolute top-0 right-0 flex items-center gap-2 text-uecg-blue text-[10px] font-bold uppercase tracking-widest bg-blue-50 px-3 py-1.5 animate-pulse rounded-sm z-10 border border-blue-100 shadow-sm">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Actualizando...
          </div>
        )}

        {/* CABECERA (Brutalismo Suizo) */}
        <SubjectsHeader
          canManageSubjects={canManageSubjects}
          onOpenCreate={() => handleAction('create')}
          isFetching={isFetching}
          isPending={isPending}
        />

        {/* FILTROS (Buscador, Toggle y Niveles Suiza) */}
        <SubjectsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          allowedLevels={allowedLevels}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* CONTENIDOS DE LAS VISTAS (Condicional Tabla/Grid) */}
        <div className="w-full mt-2">
          {viewMode === 'table' ? (
            <SubjectsTable
              subjects={subjects}
              isPending={isPending}
              isFetching={isFetching}
              onAction={handleAction}
              canManage={canManageSubjects}
            />
          ) : (
            <SubjectsGrid
              subjects={subjects}
              isPending={isPending}
              isFetching={isFetching}
              onAction={handleAction}
              canManage={canManageSubjects}
            />
          )}
        </div>
      </div>

      {/* PAGINACIÓN */}
      <SubjectsPagination
        page={page}
        totalPages={meta.totalPages}
        totalItems={meta.total}
        onPageChange={setPage}
      />

      {/* CAJÓN LATERAL PORTAL */}
      <SubjectDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        mode={drawerMode}
        subjectData={selectedSubject}
        allowedLevels={allowedLevels}
        createMutation={createMutation}
        updateMutation={updateMutation}
        deleteMutation={deleteMutation}
      />
    </div>
  )
}
