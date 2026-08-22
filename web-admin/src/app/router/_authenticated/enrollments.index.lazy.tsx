import { useState } from 'react'
import { createLazyFileRoute, useRouteContext } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

// Hooks Co-localizados de la Feature
import { useEnrollmentsData } from '@/features/enrollments/hooks/use-enrollments-data'
import { useEnrollmentActions } from '@/features/enrollments/hooks/use-enrollment-actions'

// Componentes UI de la Feature
import { EnrollmentsHeader } from '@/features/enrollments/components/EnrollmentsHeader'
import EnrollmentsFilters from '@/features/enrollments/components/EnrollmentsFilters'
import EnrollmentsTable from '@/features/enrollments/components/EnrollmentsTable'
import EnrollmentsGrid from '@/features/enrollments/components/EnrollmentsGrid'
import EnrollmentsPagination from '@/features/enrollments/components/EnrollmentsPagination'
import ApproveEnrollmentDrawer from '@/features/enrollments/components/ApproveEnrollmentDrawer'

export const Route = createLazyFileRoute('/_authenticated/enrollments/')({
  component: EnrollmentsPage,
})

function EnrollmentsPage() {
  // 1. Obtener ABAC síncronamente desde el contexto del Router
  const { can } = useRouteContext({ from: '/_authenticated' })
  const canReadEnrollments =
    can('read:all', 'Enrollment') ||
    can('read:own', 'Student') ||
    can('manage:all', 'all')
  const canManageEnrollments =
    can('write:any', 'Enrollment') || can('manage:all', 'all')

  // Estado del Toggle de Vista
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  // 2. Inyección de Datos Académicos
  const {
    page,
    setPage,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    enrollments,
    meta,
    isPending,
    isFetching,
    refetch,
  } = useEnrollmentsData(canReadEnrollments)

  // 3. Inyección de Acciones Administrativas
  const {
    isApproveDrawerOpen,
    selectedEnrollmentForApprove,
    generatingPdfId,
    handleOpenApproveDrawer,
    closeApproveDrawer,
    handleReject,
    handleGeneratePdf,
  } = useEnrollmentActions(canManageEnrollments, refetch)

  if (isPending) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-uecg-blue" />
      </div>
    )
  }

  // 4. Renderizado Orquestado con Cero Lógica Inline
  return (
    <div className="flex flex-col gap-6 max-w-7xl relative animate-in fade-in duration-300 w-full min-h-[calc(100vh-140px)]">
      <EnrollmentsHeader
        canManageEnrollments={canManageEnrollments}
        isFetching={isFetching}
        isPending={isPending}
      />

      <EnrollmentsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Renderizado condicional de vistas */}
      {viewMode === 'table' ? (
        <EnrollmentsTable
          enrollments={enrollments}
          isPending={isPending}
          isFetching={isFetching}
          generatingPdfId={generatingPdfId}
          onPrint={handleGeneratePdf}
          onApprove={handleOpenApproveDrawer}
          onReject={handleReject}
          canManage={canManageEnrollments}
        />
      ) : (
        <EnrollmentsGrid
          enrollments={enrollments}
          isPending={isPending}
          isFetching={isFetching}
          generatingPdfId={generatingPdfId}
          onPrint={handleGeneratePdf}
          onApprove={handleOpenApproveDrawer}
          onReject={handleReject}
          canManage={canManageEnrollments}
        />
      )}

      {/* Paginación fijada en el fondo */}
      <EnrollmentsPagination
        page={page}
        totalPages={meta.totalPages}
        totalItems={meta.total}
        onPageChange={setPage}
      />

      {/* Cajón interactivo consolidado en Portal */}
      <ApproveEnrollmentDrawer
        isOpen={isApproveDrawerOpen}
        onClose={closeApproveDrawer}
        enrollment={selectedEnrollmentForApprove}
      />
    </div>
  )
}
