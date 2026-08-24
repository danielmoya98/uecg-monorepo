import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { DragDropContext } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { Loader2, X, FileText, CalendarDays, MapPin, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

import { useTimetablesData } from '../hooks/use-timetables-data'
import { useTimetableExport } from '../hooks/use-timetable-export'
import { PhysicalSpacesService } from '@/features/physical-spaces'
import { InstitutionsService } from '@/features/institutions/api/institutions.service'
import type { Classroom } from '@/features/classrooms/types/classrooms.types'
import type { TimetableSlot } from '../types/timetables.types'

import { SubjectBank } from './subject-bank'
import { GridTable } from './grid-table'
import { CustomSelect } from './custom-select'

// ==========================================
// PROPS DEL COMPONENTE
// ==========================================
interface ClassroomScheduleDrawerProps {
  classroom: Classroom
  onClose: () => void
  canManage: boolean
}

// ==========================================
// SKELETON: Carga del Drawer
// ==========================================
function DrawerSkeleton({ canManage }: { canManage: boolean }) {
  return (
    <div className="flex flex-1 overflow-hidden animate-pulse bg-white">
      {canManage && (
        <div className="w-56 md:w-60 shrink-0 bg-white border-r border-gray-200 p-4 flex flex-col gap-3">
          <div className="h-4 w-32 bg-gray-200 mb-2" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 border border-gray-200" />
          ))}
        </div>
      )}
      <div className="flex-1 p-6">
        <div className="w-full h-10 bg-gray-200 mb-2" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="w-full h-16 bg-gray-50 border-b border-gray-200 mb-1" />
        ))}
      </div>
    </div>
  )
}

// ==========================================
// EMPTY STATE: Reloj no configurado
// ==========================================
function DrawerEmptyState({ shift }: { shift: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50/80">
      <div className="border-4 border-dashed border-gray-300 p-12 flex flex-col items-center text-center max-w-lg bg-white shadow-sm">
        <div className="p-4 bg-red-50 border border-red-100 mb-4 rounded-full">
          <Clock className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-uecg-dark">
          Reloj Escolar Incompleto
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-uecg-gray mt-3 leading-relaxed">
          No se encontraron periodos de clase configurados para el{' '}
          <span className="text-uecg-blue font-black">TURNO {shift}</span>. El sistema necesita
          conocer las horas de inicio, fin y recreos antes de permitir organizar materias.
        </p>
      </div>
    </div>
  )
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export function ClassroomScheduleDrawer({
  classroom,
  onClose,
  canManage,
}: ClassroomScheduleDrawerProps) {
  const { user } = useRouteContext({ from: '/_authenticated' })

  // Estados para el Sub-drawer de reasignación de espacios físicos (aulas)
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null)
  const [editSpaceId, setEditSpaceId] = useState<string>('')

  const isEditDrawerOpen = !!editingSlot

  // Bloqueo de scroll global al montar
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Cierre en tecla Escape (A11y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingSlot) {
          setEditingSlot(null)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingSlot, onClose])

  // QUERIES globales externas
  const { data: institution } = useQuery({
    queryKey: ['currentInstitution'],
    queryFn: InstitutionsService.getCurrent,
  })

  const { data: spacesData } = useQuery({
    queryKey: ['physicalSpaces'],
    queryFn: () => PhysicalSpacesService.getAll(undefined, true),
  })

  // Hook central de Horarios (Lógica encapsulada y separada de UI)
  const {
    periods,
    scheduleSlots,
    bankAssignments,
    isLoading,
    createSlot,
    isCreating,
    deleteSlot,
    isDeleting,
    updateSpace,
    isUpdatingSpace,
  } = useTimetablesData({
    classroomId: classroom.id,
    shift: classroom.shift,
    canManage,
  })

  // Hook central de Exportaciones
  const { isDownloadingPdf, handleDownloadIndividualPDF } = useTimetableExport()

  const spaceOptions = (spacesData || []).map((s) => ({
    value: s.id,
    label: `${s.name} (${s.type})`,
  }))

  const onDragEnd = (result: DropResult) => {
    if (!canManage) return
    const { destination, draggableId } = result
    if (!destination || destination.droppableId === 'bank') return

    // Obtenemos el ID de asignación del profesor desde el Draggable ID
    const assignmentId = draggableId.split('_')[0]
    const destStr = destination.droppableId

    if (destStr.startsWith('slot_')) {
      const parts = destStr.split('_')
      const targetAssignment = bankAssignments.find((a) => a.id === assignmentId)

      if (!targetAssignment) return

      createSlot({
        dayOfWeek: parseInt(parts[1], 10),
        classPeriodId: parts[2],
        teacherAssignmentId: assignmentId,
        classroomId: classroom.id,
        teacherId: targetAssignment.teacher.id,
        physicalSpaceId: classroom.baseRoom?.id || null,
      })
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-end pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Matriz de horarios para el aula ${classroom.grade} ${classroom.section}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-uecg-dark/85 will-change-[opacity] transform-gpu transition-opacity duration-200 animate-in fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Contenedor del Drawer */}
      <div className="relative w-full md:w-[98vw] h-full bg-gray-50 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-300 will-change-transform transform-gpu">
        <header className="bg-uecg-dark text-white px-6 py-4 md:px-8 md:py-5 border-b border-white/10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4 md:gap-6">
            <div
              className="w-10 h-10 bg-uecg-blue flex items-center justify-center shadow-sm hidden md:flex"
              aria-hidden="true"
            >
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-300 border border-blue-400/30 px-2 py-0.5">
                  Turno {classroom.shift}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 hidden sm:block">
                  Educación {classroom.level}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mt-1 leading-none">
                {classroom.grade} "{classroom.section}"
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={() =>
                handleDownloadIndividualPDF(
                  classroom.id,
                  classroom.grade,
                  classroom.section,
                  classroom.level
                )
              }
              disabled={isLoading || periods.length === 0 || isDownloadingPdf}
              className="px-4 py-2.5 md:px-6 md:py-3 border border-white/30 text-white hover:bg-white hover:text-uecg-dark transition-colors text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span className="hidden sm:block">
                {isDownloadingPdf ? 'Generando...' : 'Generar PDF'}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 md:p-2.5 bg-white/10 hover:bg-red-600 transition-colors cursor-pointer outline-none shadow-sm"
              aria-label="Cerrar cajón"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </header>

        {/* Control de estados (Loading, Empty, Data) */}
        {isLoading ? (
          <DrawerSkeleton canManage={canManage} />
        ) : periods.length === 0 ? (
          <DrawerEmptyState shift={classroom.shift} />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-1 overflow-hidden">
              {/* Solo los gestores ven la columna lateral de materias a arrastrar */}
              {canManage && (
                <div className="w-56 md:w-60 shrink-0 bg-white border-r border-uecg-line flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                  <SubjectBank assignments={bankAssignments} />
                </div>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] p-4 md:p-6 relative">
                {/* Overlay visual durante mutaciones */}
                {(isCreating || isDeleting) && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/75">
                    <div className="bg-uecg-dark text-white px-6 py-4 flex items-center gap-3 shadow-2xl">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Sincronizando Malla...
                      </span>
                    </div>
                  </div>
                )}

                <GridTable
                  periods={periods}
                  scheduleSlots={scheduleSlots}
                  onDeleteSlot={canManage ? deleteSlot : undefined}
                  isDeleting={isDeleting}
                  institutionMode={institution?.schedulingMode}
                  onEditSpace={
                    canManage
                      ? (slot: TimetableSlot) => {
                          setEditingSlot(slot)
                          setEditSpaceId(slot.physicalSpace?.id || '')
                        }
                      : undefined
                  }
                  canManage={canManage}
                  currentUserId={user?.id}
                />
              </div>
            </div>
          </DragDropContext>
        )}
      </div>

      {/* SUB-DRAWER: EDICIÓN DE ESPACIO FÍSICO */}
      {canManage && isEditDrawerOpen && (
        <div
          className="fixed inset-0 z-[10000] flex justify-end pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Reasignar aula física"
        >
          {/* Sub-backdrop */}
          <div
            className="absolute inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu transition-opacity duration-200 cursor-pointer"
            onClick={!isUpdatingSpace ? () => setEditingSlot(null) : undefined}
          />

          <div className="relative h-full w-full max-w-[400px] border-l border-uecg-line bg-white shadow-2xl flex flex-col animate-in slide-in-from-right will-change-transform transform-gpu">
            <div className="bg-uecg-blue text-white border-b border-uecg-blue/20 p-6 relative overflow-hidden shrink-0">
              <div
                className="absolute -left-4 -bottom-4 w-16 h-16 border-[4px] border-white opacity-10 rounded-none rotate-12 pointer-events-none"
                aria-hidden="true"
              />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 bg-white text-uecg-blue flex items-center justify-center shadow-sm"
                    aria-hidden="true"
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white leading-none mt-1">
                      Modificar Aula
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  disabled={isUpdatingSpace}
                  className="p-1.5 text-white/50 hover:text-white transition-colors cursor-pointer outline-none"
                  aria-label="Cerrar reasignador"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              <p className="text-[10px] text-uecg-gray font-bold uppercase tracking-widest mb-6 leading-relaxed bg-gray-50 p-4 border border-uecg-line border-l-2 border-l-uecg-blue">
                Se modificará el espacio físico para la materia de{' '}
                <span className="text-uecg-blue font-black">
                  {editingSlot?.teacherAssignment?.subject?.name}
                </span>
                .
              </p>

              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-uecg-dark">
                  Ubicación Asignada
                </label>
                <CustomSelect
                  value={editSpaceId}
                  onChange={setEditSpaceId}
                  options={[{ value: '', label: '-- SIN AULA ASIGNADA --' }, ...spaceOptions]}
                  placeholder="-- SELECCIONAR AULA --"
                />
              </div>
            </div>

            <div className="p-5 border-t border-uecg-line bg-gray-50 flex gap-3 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                disabled={isUpdatingSpace}
                className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest border border-uecg-line text-uecg-gray hover:bg-white shadow-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => updateSpace({ id: editingSlot.id, physicalSpaceId: editSpaceId || null })}
                disabled={isUpdatingSpace}
                className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest bg-uecg-dark text-white hover:bg-uecg-blue flex justify-center items-center gap-2 shadow-sm cursor-pointer"
              >
                {isUpdatingSpace ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
export default ClassroomScheduleDrawer
