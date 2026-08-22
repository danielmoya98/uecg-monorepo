import { useState } from 'react'
import { BookOpen, Loader2, Save } from 'lucide-react'

// Hooks SRP
import { useGradesWorkspace } from '../hooks/use-grades-workspace'

// Componentes
import { GradesHeader } from './grades-header'
import { GradesFilters } from './grades-filters'
import { ClosedTrimesterWarning } from './closed-trimester-warning'
import { GradeRow } from './grade-row'
import ChangeRequestsDrawer from './change-requests-drawer'

export default function GradesPage() {
  const [isRequestsDrawerOpen, setIsRequestsDrawerOpen] = useState(false)

  // Inyectamos todo el cerebro de operaciones
  const workspace = useGradesWorkspace()

  // Si no tiene acceso, el useEffect del hook lo redirecciona
  if (!workspace.hasAccess) {
    return (
      <div className="flex h-[50vh] items-center justify-center" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-uecg-blue" />
      </div>
    )
  }

  const showBulkSaveButton =
    workspace.selectedAssignment &&
    workspace.selectedTrimester &&
    (workspace.studentsGrades?.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-20 relative animate-in fade-in duration-300 w-full min-h-[calc(100vh-140px)]">
      {workspace.canManageGrades && (
        <ChangeRequestsDrawer
          isOpen={isRequestsDrawerOpen}
          onClose={() => setIsRequestsDrawerOpen(false)}
        />
      )}

      <GradesHeader
        canManageGrades={workspace.canManageGrades}
        pendingRequestsCount={workspace.pendingRequests.length}
        onOpenRequests={() => setIsRequestsDrawerOpen(true)}
      />

      <GradesFilters
        selectedTrimester={workspace.selectedTrimester}
        setSelectedTrimester={workspace.setSelectedTrimester}
        trimestersOptions={workspace.trimestersOptions}
        selectedClassroom={workspace.selectedClassroom}
        setSelectedClassroom={(val) => {
          workspace.setSelectedClassroom(val)
          workspace.setSelectedAssignment('')
        }}
        classroomsOptions={workspace.classroomsOptions}
        selectedAssignment={workspace.selectedAssignment}
        setSelectedAssignment={workspace.setSelectedAssignment}
        assignmentsOptions={workspace.assignmentsOptions}
      />

      {workspace.selectedTrimester && !workspace.isCurrentTrimesterOpen && (
        <ClosedTrimesterWarning />
      )}

      {/* PANEL MAESTRO DE ACCIÓN */}
      {showBulkSaveButton && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={workspace.handleBulkSave}
            disabled={workspace.isSaving || !workspace.isCurrentTrimesterOpen}
            className="flex items-center gap-2 bg-uecg-dark text-white px-6 py-4 font-black uppercase tracking-widest text-xs hover:bg-uecg-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] outline-none focus-visible:ring-2 focus-visible:ring-uecg-blue cursor-pointer"
          >
            {workspace.isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {workspace.isSaving ? 'Guardando Planilla...' : 'Guardar Planilla Completa'}
          </button>
        </div>
      )}

      {/* TABLA PRINCIPAL */}
      <div className="bg-white border border-uecg-line shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {!workspace.selectedAssignment || !workspace.selectedTrimester ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 bg-gray-50/50">
            <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-[11px] font-black uppercase tracking-widest text-uecg-gray">
              Seleccione parámetros para cargar
            </h3>
          </div>
        ) : workspace.isGradesLoading ? (
          <div className="flex-1 flex items-center justify-center p-20" aria-live="polite">
            <Loader2 className="w-8 h-8 animate-spin text-uecg-blue" />
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <caption className="sr-only">
                Planilla de notas académicas del curso seleccionado
              </caption>
              <thead>
                <tr className="bg-uecg-dark text-white text-[10px] font-black uppercase tracking-widest leading-none">
                  <th className="p-3 border-r border-white/20" scope="col">
                    Estudiante
                  </th>
                  <th className="p-3 text-center border-r border-white/20 w-16" scope="col">
                    SER
                  </th>
                  <th className="p-3 text-center border-r border-white/20 w-16" scope="col">
                    SAB
                  </th>
                  <th className="p-3 text-center border-r border-white/20 w-16" scope="col">
                    HAC
                  </th>
                  <th className="p-3 text-center border-r border-white/20 w-16" scope="col">
                    AUT
                  </th>
                  <th
                    className="p-2 text-center border-r border-white/20 text-gray-400 bg-black/20 w-16"
                    scope="col"
                  >
                    SUMA
                  </th>
                  <th
                    className="p-2 text-center border-r border-white/20 text-red-200 bg-red-900/50 w-20"
                    scope="col"
                  >
                    RECUP.
                  </th>
                  <th className="p-3 text-center bg-blue-600 w-20" scope="col">
                    FINAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {workspace.studentsGrades?.map((studentData) => (
                  <GradeRow
                    key={studentData.enrollmentId}
                    studentData={studentData}
                    isTrimesterOpen={workspace.isCurrentTrimesterOpen}
                    scores={
                      workspace.gradesDict[studentData.enrollmentId] || {
                        ser: '',
                        saber: '',
                        hacer: '',
                        auto: '',
                        recovery: '',
                      }
                    }
                    onScoreChange={(field, value) =>
                      workspace.handleScoreChange(studentData.enrollmentId, field, value)
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
