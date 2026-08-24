import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'

import { toast } from 'sonner'
import { AttendanceService } from '../api/attendance.service'
import type { ManualAttendancePayload } from '../types/attendance.types'

interface AttendanceMonitorProps {
  classroomId: string
  classPeriodId: string
  allClassPeriodIds?: string[]
  date?: string
}

const statusMap = {
  PENDING: { label: 'Esperando', classes: 'text-gray-400 bg-gray-100 border-gray-200' },
  PRESENT: { label: 'Presente', classes: 'text-green-700 bg-green-50 border-green-200' },
  LATE: { label: 'Atraso', classes: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  ABSENT: { label: 'Falta', classes: 'text-red-700 bg-red-50 border-red-200' },
  EXCUSED: { label: 'Licencia', classes: 'text-blue-700 bg-blue-50 border-blue-200' },
}

export const AttendanceMonitor = ({
  classroomId,
  classPeriodId,
  allClassPeriodIds,
  date,
}: AttendanceMonitorProps) => {
  const queryClient = useQueryClient()
  const { can } = useRouteContext({ from: '/_authenticated' })

  const canMarkAttendance =
    can('create:own', 'Attendance') || can('manage:all', 'Attendance')

  const { data: monitorResponse, isLoading } = useQuery({
    queryKey: ['attendanceMonitor', classroomId, classPeriodId, date],
    queryFn: () => AttendanceService.getMonitor({ classroomId, classPeriodId, date }),
    refetchInterval: 5000,
  })

  const manualMutation = useMutation({
    mutationFn: (payload: ManualAttendancePayload) => AttendanceService.markManual(payload),
    onSuccess: (_, variables) => {
      const spanishStatus =
        variables.status === 'PRESENT'
          ? 'Presente'
          : variables.status === 'LATE'
            ? 'Atraso'
            : variables.status === 'ABSENT'
              ? 'Falta'
              : 'Licencia'
      toast.success(`Asistencia marcada como ${spanishStatus}`)
      queryClient.invalidateQueries({ queryKey: ['attendanceMonitor'] })
    },
    onError: () => toast.error('Error al registrar asistencia manual'),
  })

  const handleManualMark = (
    enrollmentId: string,
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED',
  ) => {
    manualMutation.mutate({
      enrollmentId,
      classPeriodId,
      classPeriodIds: allClassPeriodIds || [classPeriodId],
      status,
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-300">
        {/* Skeleton Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-uecg-line bg-white shadow-sm animate-pulse">
          <div className="h-12 bg-gray-100" />
          <div className="h-12 bg-gray-100" />
          <div className="h-12 bg-gray-100" />
          <div className="h-12 bg-gray-100" />
        </div>

        {/* Skeleton Table */}
        <div className="border border-uecg-line bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-uecg-line">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">Estudiante</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line text-center">Hora</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line text-center">Estado</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray text-center">Acción Manual</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={`att-sk-${i}`} className="border-b border-uecg-line animate-pulse">
                  <td className="px-4 py-3 border-r border-uecg-line">
                    <div className="h-3.5 w-48 bg-gray-200" />
                    <div className="h-2.5 w-24 bg-gray-100 mt-1" />
                  </td>
                  <td className="px-4 py-3 border-r border-uecg-line text-center">
                    <div className="h-3 w-16 bg-gray-100 mx-auto" />
                  </td>
                  <td className="px-4 py-3 border-r border-uecg-line text-center">
                    <div className="h-5 w-20 bg-gray-200 mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-7 w-32 bg-gray-100 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }


  const students = monitorResponse?.data || []
  const summary = monitorResponse?.summary || {
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    pending: 0,
  }

  if (!Array.isArray(students) || students.length === 0) {
    return (
      <div className="p-16 border border-uecg-line bg-white text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-uecg-gray mx-auto mb-3 opacity-50" />
        <h3 className="text-sm font-black uppercase tracking-widest text-uecg-dark">
          Curso Vacío o Sin Datos
        </h3>
        <p className="text-xs font-bold text-uecg-gray mt-2">
          No hay alumnos inscritos en este curso o no se encontraron registros.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="border border-uecg-line bg-white p-4 text-center shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">
            Total Alumnos
          </span>
          <p className="text-2xl font-black text-uecg-dark mt-1">{summary.total}</p>
        </div>
        <div className="border border-green-200 bg-green-50/50 p-4 text-center shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-green-700">
            Presentes
          </span>
          <p className="text-2xl font-black text-green-700 mt-1">{summary.present}</p>
        </div>
        <div className="border border-yellow-200 bg-yellow-50/50 p-4 text-center shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700">
            Atrasos
          </span>
          <p className="text-2xl font-black text-yellow-700 mt-1">{summary.late}</p>
        </div>
        <div className="border border-red-200 bg-red-50/50 p-4 text-center shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-700">
            Faltas
          </span>
          <p className="text-2xl font-black text-red-700 mt-1">{summary.absent}</p>
        </div>
        <div className="border border-gray-200 bg-gray-50/50 p-4 text-center shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Esperando
          </span>
          <p className="text-2xl font-black text-gray-500 mt-1">{summary.pending}</p>
        </div>
      </div>

      {/* TABLA DE ALUMNOS Y ACCIONES */}
      <div className="bg-white border border-uecg-line overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-uecg-dark text-white text-[10px] font-black uppercase tracking-widest select-none">
              <th className="p-4 border-b border-gray-700">Estudiante</th>
              <th className="p-4 border-b border-gray-700 text-center">Estado Actual</th>
              <th className="p-4 border-b border-gray-700">Hora de Registro</th>
              {canMarkAttendance && (
                <th className="p-4 border-b border-gray-700 text-right">Acciones Rápidas</th>
              )}
            </tr>
          </thead>
          <tbody className="text-xs font-bold uppercase text-uecg-text">
            {students.map((student, index) => {
              const currentStatus = student.status || 'PENDING'
              const config = statusMap[currentStatus] || statusMap.PENDING

              return (
                <tr
                  key={student.studentId}
                  className="border-b border-uecg-line hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4">
                    <span className="text-gray-400 font-mono mr-2">{index + 1}.</span>
                    {student.fullName}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 text-[10px] tracking-widest border font-black ${config.classes}`}
                    >
                      {currentStatus === 'PRESENT' && <CheckCircle2 className="w-3 h-3" />}
                      {currentStatus === 'LATE' && <Clock className="w-3 h-3" />}
                      {currentStatus === 'ABSENT' && <XCircle className="w-3 h-3" />}
                      {config.label}
                    </span>
                  </td>
                  <td className="p-4 text-uecg-gray tracking-widest text-[10px] font-mono">
                    {student.timestamp
                      ? new Date(student.timestamp).toLocaleTimeString('es-BO')
                      : '--:--:--'}
                  </td>

                  {canMarkAttendance && (
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleManualMark(student.enrollmentId, 'PRESENT')}
                          disabled={manualMutation.isPending}
                          className="p-1.5 text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200 transition-all outline-none cursor-pointer disabled:opacity-5"
                          title="Marcar Presente"
                          aria-label={`Marcar a ${student.fullName} como Presente`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleManualMark(student.enrollmentId, 'LATE')}
                          disabled={manualMutation.isPending}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 border border-transparent hover:border-yellow-200 transition-all outline-none cursor-pointer disabled:opacity-5"
                          title="Marcar Atraso"
                          aria-label={`Marcar a ${student.fullName} como Atrasado`}
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleManualMark(student.enrollmentId, 'ABSENT')}
                          disabled={manualMutation.isPending}
                          className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all outline-none cursor-pointer disabled:opacity-5"
                          title="Marcar Falta"
                          aria-label={`Marcar a ${student.fullName} como Falta`}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
