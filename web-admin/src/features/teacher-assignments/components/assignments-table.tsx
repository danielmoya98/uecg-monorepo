import { Trash2, UserCheck, BookOpen } from 'lucide-react'
import { SwissTableContainer, SwissEmptyState } from '@/shared/ui'
import type { TeacherAssignment } from '../types/teacher-assignments.types'

interface AssignmentsTableProps {
  assignments: TeacherAssignment[]
  isFetching?: boolean
  isPending?: boolean
  onDeleteRequest: (assignment: TeacherAssignment) => void
  onReassignRequest?: (assignment: TeacherAssignment) => void
  canManage: boolean
}

export const AssignmentsTable = ({
  assignments,
  isFetching = false,
  isPending = false,
  onDeleteRequest,
  onReassignRequest,
  canManage,
}: AssignmentsTableProps) => {
  const colSpanCount = canManage ? 3 : 2
  const showSkeleton = isPending || (isFetching && assignments.length === 0)

  return (
    <SwissTableContainer isFetching={isFetching} isPending={isPending}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-uecg-line">
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Materia
            </th>
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Docente Asignado
            </th>
            {canManage && (
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray text-center w-28">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {showSkeleton ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={`assign-sk-${i}`} className="border-b border-uecg-line animate-pulse">
                <td className="px-4 py-4 border-r border-uecg-line">
                  <div className="h-4 w-40 bg-gray-200" />
                </td>
                <td className="px-4 py-4 border-r border-uecg-line">
                  <div className="h-3 w-48 bg-gray-100" />
                </td>
                {canManage && (
                  <td className="px-4 py-4 text-center">
                    <div className="h-4 w-12 bg-gray-200 mx-auto" />
                  </td>
                )}
              </tr>
            ))
          ) : assignments.length === 0 ? (
            <tr>
              <td colSpan={colSpanCount} className="p-0">
                <SwissEmptyState
                  icon={BookOpen}
                  title="Sin Materias Asignadas"
                  description="Este curso aún no tiene materias asignadas a ningún docente."
                />
              </td>
            </tr>
          ) : (
            assignments.map((a, index) => (
              <tr
                key={a.id}
                className="border-b border-uecg-line hover:bg-gray-50 transition-colors group animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td className="px-4 py-3 border-r border-uecg-line">
                  <p className="font-black uppercase tracking-tight text-uecg-text text-xs">
                    {a.subject.name}
                  </p>
                </td>
                <td className="px-4 py-3 border-r border-uecg-line">
                  <p className="text-[11px] font-bold text-uecg-gray uppercase tracking-widest">
                    {a.teacher.fullName}
                  </p>
                </td>
                {canManage && (
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {onReassignRequest && (
                        <button
                          type="button"
                          onClick={() => onReassignRequest(a)}
                          className="text-uecg-gray hover:text-uecg-blue transition-colors focus:outline-none outline-none cursor-pointer p-1"
                          title="Reasignar Docente Titular"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteRequest(a)}
                        className="text-uecg-gray hover:text-red-600 transition-colors focus:outline-none outline-none cursor-pointer p-1"
                        title="Eliminar asignación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </SwissTableContainer>
  )
}

export default AssignmentsTable
