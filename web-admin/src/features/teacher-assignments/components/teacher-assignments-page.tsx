import { useState } from 'react'
import { useRouteContext } from '@tanstack/react-router'
import { ShieldAlert } from 'lucide-react'
import { useAssignmentsData } from '../hooks/use-assignments-data'
import { useClassroomSelection } from '../hooks/use-classroom-selection'
import { useClassroomAssignments } from '../hooks/use-classroom-assignments'
import { useCloneDrawer } from '../hooks/use-clone-drawer'
import { AssignmentsHeader, NoActiveYearAlert, TeacherAssignmentsSkeleton } from './ui-parts'

import ClassroomSelector from './classroom-selector'
import AssignmentPanel from './assignment-panel'
import DeleteAssignmentDrawer from './delete-assignment-drawer'
import CloneAssignmentsDrawer from './clone-assignments-drawer'
import ReassignTeacherModal from './reassign-teacher-modal'
import type { TeacherAssignment } from '../types/teacher-assignments.types'

export const TeacherAssignmentsPage = () => {
  // 1. Permisos ABAC mediante el contexto del Router
  const { can } = useRouteContext({ from: '/_authenticated' })
  const canManageAssignments = can('manage:all', 'TeacherAssignment') || can('manage:all', 'all')
  const canReadAssignments =
    can('manage:all', 'TeacherAssignment') ||
    can('read:all', 'TeacherAssignment') ||
    can('manage:all', 'all')

  // 2. Inyección de Dependencias de Servidor y Selección
  const { currentYear, isFixedBaseMode, classrooms, teachers, isLoading } =
    useAssignmentsData(canManageAssignments)

  const { selectedClassroom, handleSelectClassroom } = useClassroomSelection(classrooms)

  // 3. Obtener asignaciones y operaciones para el curso seleccionado
  const {
    assignments,
    subjects,
    isFetchingAssignments,
    assignMutation,
    updateMutation,
    deleteMutation,
    cloneMutation,
  } = useClassroomAssignments(selectedClassroom, canManageAssignments)

  const { isCloneDrawerOpen, assignmentsToClone, handleOpenClone, closeCloneDrawer } =
    useCloneDrawer(canManageAssignments)

  // Drawer de Eliminación
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState<TeacherAssignment | null>(null)

  // Modal de Reasignación
  const [isReassignOpen, setIsReassignOpen] = useState(false)
  const [assignmentToReassign, setAssignmentToReassign] = useState<TeacherAssignment | null>(null)

  const handleDeleteRequest = (assignment: TeacherAssignment) => {
    setAssignmentToDelete(assignment)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setIsDeleteOpen(false)
        setAssignmentToDelete(null)
      },
    })
  }

  const handleReassignRequest = (assignment: TeacherAssignment) => {
    setAssignmentToReassign(assignment)
    setIsReassignOpen(true)
  }

  const handleReassignConfirm = ({ id, teacherId }: { id: string; teacherId: string }) => {
    updateMutation.mutate(
      { id, teacherId },
      {
        onSuccess: () => {
          setIsReassignOpen(false)
          setAssignmentToReassign(null)
        },
      }
    )
  }

  // Guard de acceso restringido en UI en caso de bypass del router
  if (!canReadAssignments) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-red-200 bg-red-50/50 shadow-sm w-full min-h-[400px]">
        <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mb-5 animate-pulse">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-red-800 mb-2">
          Acceso Restringido
        </h3>
        <p className="text-xs text-red-700 font-bold uppercase tracking-widest max-w-md leading-relaxed">
          Tu cuenta no cuenta con las facultades operativas suficientes para consultar la carga horaria.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return <TeacherAssignmentsSkeleton />
  }


  if (!currentYear) {
    return <NoActiveYearAlert />
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] w-full animate-in fade-in duration-300">
      <AssignmentsHeader
        year={currentYear.year}
        canManage={canManageAssignments}
        onOpenClone={() => handleOpenClone(assignments)}
        isCloneDisabled={!selectedClassroom || assignments.length === 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[60vh] pb-20">
        {/* COLUMNA IZQUIERDA (Selector de Cursos) */}
        <div className="lg:col-span-4">
          <ClassroomSelector
            classrooms={classrooms}
            selectedId={selectedClassroom?.id}
            onSelect={handleSelectClassroom}
            isFixedBaseMode={isFixedBaseMode}
          />
        </div>

        {/* COLUMNA DERECHA (Panel Detallado) */}
        <div className="lg:col-span-8">
          <AssignmentPanel
            classroom={selectedClassroom}
            teachers={teachers}
            isFixedBaseMode={isFixedBaseMode}
            canManage={canManageAssignments}
            assignments={assignments}
            subjects={subjects}
            isFetchingAssignments={isFetchingAssignments}
            onAssign={(formData) => {
              if (selectedClassroom) {
                assignMutation.mutate({
                  classroomId: selectedClassroom.id,
                  subjectId: formData.subjectId,
                  teacherId: formData.teacherId,
                })
              }
            }}
            isAssignPending={assignMutation.isPending}
            onDeleteRequest={handleDeleteRequest}
            onReassignRequest={handleReassignRequest}
            onOpenCloneDrawer={handleOpenClone}
          />
        </div>
      </div>

      {/* Modal de Reasignación de Docente */}
      {canManageAssignments && (
        <ReassignTeacherModal
          isOpen={isReassignOpen}
          onClose={() => {
            setIsReassignOpen(false)
            setAssignmentToReassign(null)
          }}
          assignment={assignmentToReassign}
          teachers={teachers}
          onConfirm={handleReassignConfirm}
          isSubmitting={updateMutation.isPending}
        />
      )}

      {/* Drawer de Confirmación de Borrado */}
      {canManageAssignments && (
        <DeleteAssignmentDrawer
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          assignment={assignmentToDelete}
          onConfirm={handleDeleteConfirm}
          isSubmitting={deleteMutation.isPending}
        />
      )}

      {/* Drawer de Clonación Inteligente */}
      {canManageAssignments && (
        <CloneAssignmentsDrawer
          isOpen={isCloneDrawerOpen}
          onClose={closeCloneDrawer}
          sourceClassroom={selectedClassroom}
          currentAssignments={assignmentsToClone}
          teachers={teachers}
          classrooms={classrooms}
          onClone={(payload) => {
            cloneMutation.mutate(payload, {
              onSuccess: () => {
                closeCloneDrawer()
              },
            })
          }}
          isSubmitting={cloneMutation.isPending}
        />
      )}
    </div>
  )
}

export default TeacherAssignmentsPage
