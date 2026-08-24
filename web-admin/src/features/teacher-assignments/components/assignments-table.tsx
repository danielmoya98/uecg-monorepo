import { Trash2, UserCheck, BookOpen } from 'lucide-react'
import { SwissTableContainer, SwissEmptyState } from '@/shared/ui'
import type { TeacherAssignment } from '../types/teacher-assignments.types'

interface AssignmentsTableProps {
  assignments: TeacherAssignment[]
  isFetching: boolean
  onDeleteRequest: (assignment: TeacherAssignment) => void
  onReassignRequest?: (assignment: TeacherAssignment) => void
  canManage: boolean
}

export const AssignmentsTable = ({
  assignments,
  isFetching,
  onDeleteRequest,
  onReassignRequest,
  canManage,
}: AssignmentsTableProps) => {
  const colSpanCount = canManage ? 3 : 2

  return (
    <SwissTableContainer isFetching={isFetching}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-uecg-line dark:border-zinc-800">
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">
              Materia
            </th>
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">
              Docente Asignado
            </th>
            {canManage && (
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 text-center w-28">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 ? (
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
                className="border-b border-uecg-line dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td className="px-4 py-3 border-r border-uecg-line dark:border-zinc-800">
                  <p className="font-black uppercase tracking-tight text-uecg-text dark:text-zinc-100 text-xs">
                    {a.subject.name}
                  </p>
                </td>
                <td className="px-4 py-3 border-r border-uecg-line dark:border-zinc-800">
                  <p className="text-[11px] font-bold text-uecg-gray dark:text-zinc-400 uppercase tracking-widest">
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
                          className="text-uecg-gray dark:text-zinc-400 hover:text-uecg-blue dark:hover:text-blue-400 transition-colors focus:outline-none outline-none cursor-pointer p-1"
                          title="Reasignar Docente Titular"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteRequest(a)}
                        className="text-uecg-gray dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors focus:outline-none outline-none cursor-pointer p-1"
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
