import {
  AcademicYearsHeader,
  AcademicYearsToolbar,
  AcademicYearsTable,
} from './academic-years-ui'
import AcademicYearDrawer from './academic-year-drawer'
import TrimestersDrawer from './trimesters-drawer'
import { SetupWizardWidget } from './setup-wizard-widget'
import { useAcademicYearsData } from '../hooks/use-academic-years-data'
import { useAcademicYearsDrawers } from '../hooks/use-academic-years-drawers'

export default function AcademicYearsPage() {
  const {
    page,
    setPage,
    searchTerm,
    setSearchTerm,
    years,
    meta,
    isLoadingData,
    updateStatus,
    isUpdatingStatus,
    updatingId,
    saveAcademicYear,
    isSaving,
    deleteAcademicYear,
    isDeleting,
  } = useAcademicYearsData()

  const {
    isDrawerOpen,
    drawerMode,
    selectedYear,
    openForm,
    closeForm,
    isTrimestersDrawerOpen,
    openTrimesters,
    closeTrimesters,
  } = useAcademicYearsDrawers()

  return (
    <div className="flex flex-col gap-6 w-full min-h-[calc(100vh-140px)] justify-between">
      <div className="flex flex-col gap-6 w-full">
        <AcademicYearsHeader onOpenCreate={() => openForm('create')} />

        {/* SETUP WIZARD / CHECKLIST DE PREPARACIÓN */}
        <SetupWizardWidget
          onAction={(stepId) => {
            if (stepId === 'academic_year') {
              openForm('create')
            } else if (stepId === 'first_trimester' && years.length > 0) {
              openTrimesters(years[0])
            }
          }}
        />

        <AcademicYearsToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onResetPage={() => setPage(1)}
        />

        <AcademicYearsTable
          years={years}
          isLoadingData={isLoadingData}
          onEdit={(y) => openForm('edit', y)}
          onDelete={(y) => openForm('delete', y)}
          onOpenTrimesters={openTrimesters}
          onStatusChange={(id, status) => updateStatus({ id, status })}
          isUpdatingStatus={isUpdatingStatus}
          updatingId={updatingId}
        />
      </div>

      {/* Paginación fijada abajo con Estilo Suizo Estricto */}
      <div className="flex justify-between items-center pt-4 border-t border-uecg-line bg-[var(--color-background)] pb-4 mt-auto">
        <span className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest">
          Mostrando {years.length} de {meta.total} registros
        </span>
        <div className="flex">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-uecg-line text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Anterior
          </button>
          <span className="px-4 py-2 bg-uecg-blue text-white border border-uecg-blue text-[10px] font-black uppercase tracking-widest">
            {page} / {meta.totalPages || 1}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
            className="px-4 py-2 border border-uecg-line border-l-0 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </div>

      <AcademicYearDrawer
        isOpen={isDrawerOpen}
        onClose={closeForm}
        mode={drawerMode}
        data={selectedYear}
        onSubmit={(payload) => saveAcademicYear({ id: selectedYear?.id, payload })}
        onDelete={(id) => deleteAcademicYear(id)}
        isSubmitting={isSaving || isDeleting}
      />
      <TrimestersDrawer
        isOpen={isTrimestersDrawerOpen}
        onClose={closeTrimesters}
        academicYear={selectedYear}
      />
    </div>
  )
}
