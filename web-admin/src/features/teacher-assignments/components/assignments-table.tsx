import { Trash2, UserCheck } from 'lucide-react'
import type { TeacherAssignment } from '../types/teacher-assignments.types'

interface AssignmentsTableProps {
  assignments: TeacherAssignment[]
  isFetching: boolean
  onDeleteRequest: (assignment: TeacherAssignment) => void
  onReassignRequest?: (assignment: TeacherAssignment) => void
  canManage: boolean // Propiedad ABAC inyectada
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
    <div className="border border-uecg-line bg-white">
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
        <tbody
          className={`transition-opacity duration-200 ${
            isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'
          }`}
        >
          {assignments.length === 0 ? (
            <tr>
              <td
                colSpan={colSpanCount}
                className="p-8 text-center text-uecg-gray font-bold uppercase tracking-widest text-[11px]"
              >
                Este curso aún no tiene materias asignadas.
              </td>
            </tr>
          ) : (
            assignments.map((a) => (
              <tr
                key={a.id}
                className="border-b border-uecg-line hover:bg-gray-50 transition-colors group"
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
    </div>
  )
}

export default AssignmentsTable
