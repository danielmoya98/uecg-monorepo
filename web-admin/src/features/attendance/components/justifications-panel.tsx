import { useState, useEffect } from 'react'
import {
  FileText,

  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader2,
  UserCheck,
} from 'lucide-react'

import { SwissSearchInput, SwissEmptyState } from '@/shared/ui'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { DrawerShell } from '@/shared/ui/drawer-shell'
import { AttendanceService } from '../api/attendance.service'
import { EnrollmentsService } from '@/features/enrollments/api/enrollments.service'
import type { AttendanceRecord } from '../types/attendance.types'


interface Enrollment {
  id: string
  student: {
    names: string
    lastNamePaterno: string
    ci?: string
  }
  classroom: {
    grade: string
    section: string
    level: string
  }
}

export const JustificationsPanel = () => {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)

  // Estados para el Drawer
  const [recordToJustify, setRecordToJustify] = useState<AttendanceRecord | null>(null)
  const [justificationText, setJustificationText] = useState('')

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Bloquear Scroll cuando el Drawer está abierto
  useEffect(() => {
    if (recordToJustify) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [recordToJustify])

  // 1. Buscador de Alumnos con Debounce
  const { data: studentsData, isLoading: isSearching } = useQuery({
    queryKey: ['search_students_justification', debouncedSearch],
    queryFn: () => EnrollmentsService.getAll({ page: 1, search: debouncedSearch, limit: 5 }),
    enabled: debouncedSearch.length > 2,
  })
  const foundStudents = (studentsData?.data || []) as Enrollment[]

  // 2. Traer Faltas/Atrasos
  const { data: debts, isLoading: isLoadingDebts } = useQuery({
    queryKey: ['attendance_debts', selectedEnrollment?.id],
    queryFn: () => AttendanceService.getStudentDebts(selectedEnrollment!.id),
    enabled: !!selectedEnrollment?.id,
  })

  // 3. Mutación para Justificar
  const justifyMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      AttendanceService.justify(id, text),
    onSuccess: () => {
      toast.success('Licencia registrada con éxito')
      queryClient.invalidateQueries({ queryKey: ['attendance_debts'] })
      setRecordToJustify(null)
      setJustificationText('')
    },
    onError: () => toast.error('No se pudo procesar la justificación'),
  })

  // Escuchar tecla Escape para cerrar el Drawer
  useEffect(() => {
    if (!recordToJustify) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !justifyMutation.isPending) {
        setRecordToJustify(null)
        setJustificationText('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [recordToJustify, justifyMutation.isPending])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* COLUMNA IZQUIERDA: BUSCADOR */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-white dark:bg-[#121214] border border-uecg-line dark:border-zinc-800 p-6 shadow-sm">
          <label
            htmlFor="student-search"
            className="text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 mb-3 flex items-center gap-2 select-none"
          >
            <span className="w-4 h-4 bg-uecg-dark text-white flex items-center justify-center font-mono text-[8px]">
              1
            </span>
            Buscar Estudiante
          </label>
          <SwissSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="NOMBRE O CI... (CTRL+K)"
          />

          <div className="mt-4 flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {isSearching && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin text-uecg-blue" />
              </div>
            )}
            {!isSearching && debouncedSearch.length > 2 && foundStudents.length === 0 && (
              <p className="text-[10px] text-center font-bold uppercase tracking-widest text-uecg-gray dark:text-zinc-400 p-4 border border-dashed border-uecg-line dark:border-zinc-800 select-none">
                No se encontraron resultados.
              </p>
            )}
            {foundStudents.map((enrollment) => {
              const isSelected = selectedEnrollment?.id === enrollment.id
              return (
                <button
                  key={enrollment.id}
                  type="button"
                  onClick={() => setSelectedEnrollment(enrollment)}
                  className={`p-4 border text-left transition-all shadow-sm outline-none cursor-pointer ${
                    isSelected
                      ? 'border-uecg-blue bg-uecg-blue text-white'
                      : 'border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] hover:border-uecg-blue hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
                  }`}
                  aria-pressed={isSelected}
                >
                  <p
                    className={`text-[11px] font-black uppercase tracking-tight leading-none ${
                      isSelected ? 'text-white' : 'text-uecg-dark dark:text-zinc-100'
                    }`}
                  >
                    {enrollment.student.lastNamePaterno} {enrollment.student.names}
                  </p>
                  <p
                    className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${
                      isSelected ? 'text-blue-200' : 'text-uecg-gray dark:text-zinc-400'
                    }`}
                  >
                    {enrollment.classroom.grade} "{enrollment.classroom.section}" •{' '}
                    {enrollment.classroom.level}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: HISTORIAL DE INFRACCIONES */}
      <div className="lg:col-span-8">
        {!selectedEnrollment ? (
          <div className="h-full border border-dashed border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] flex flex-col items-center justify-center text-uecg-gray min-h-[400px] shadow-sm select-none">
            <SwissEmptyState
              icon={FileText}
              title="Auditoría de Infracciones"
              description="Seleccione un estudiante de la lista lateral para revisar sus faltas y atrasos pendientes de justificación."
            />
          </div>
        ) : (
          <div className="flex flex-col h-full bg-white border border-uecg-line shadow-sm">
            <div className="bg-uecg-dark p-6 border-b border-uecg-line text-white shrink-0">
              <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest block leading-none">
                Expediente Disciplinario
              </span>
              <h3 className="text-2xl font-black uppercase tracking-tighter mt-1 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-uecg-blue" />
                {selectedEnrollment.student.names} {selectedEnrollment.student.lastNamePaterno}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-uecg-gray mt-2 bg-white/10 px-3 py-1 inline-block border border-white/20">
                CI: {selectedEnrollment.student.ci || 'S/N'}
              </p>
            </div>

            <div className="flex-1 p-6 bg-gray-50 overflow-y-auto custom-scrollbar min-h-[300px]">
              {isLoadingDebts ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-uecg-blue" />
                </div>
              ) : debts?.length === 0 ? (
                <div className="p-10 bg-green-50 border border-green-200 text-center shadow-sm select-none">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-green-800">
                    Expediente Limpio
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-700/70 mt-2">
                    El estudiante no tiene faltas ni atrasos pendientes de justificación en esta
                    gestión.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
                  {debts?.map((record) => {
                    const isAbsent = record.status === 'ABSENT'
                    return (
                      <div
                        key={record.id}
                        className="bg-white border border-uecg-line p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-uecg-dark transition-colors shadow-sm relative overflow-hidden"
                      >
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-2 ${
                            isAbsent ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                        />

                        <div className="flex items-center gap-4 pl-2">
                          <div
                            className={`w-12 h-12 flex items-center justify-center border shrink-0 shadow-sm ${
                              isAbsent
                                ? 'bg-red-55 border-red-200 text-red-600'
                                : 'bg-yellow-55 border-yellow-200 text-yellow-600'
                            }`}
                          >
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-tight text-uecg-dark leading-none">
                              {new Date(record.date).toLocaleDateString('es-BO', {
                                weekday: 'long',
                                day: '2-digit',
                                month: 'long',
                                timeZone: 'UTC',
                              })}
                            </p>
                            <div className="flex items-center gap-2 mt-2 select-none">
                              <span className="text-[9px] font-bold text-white bg-uecg-dark px-2 py-0.5 uppercase tracking-widest">
                                {record.classPeriod.name} ({record.classPeriod.startTime})
                              </span>
                              <span
                                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                                  isAbsent
                                    ? 'text-red-700 bg-red-50 border-red-200'
                                    : 'text-yellow-700 bg-yellow-50 border-yellow-200'
                                }`}
                              >
                                {isAbsent ? 'FALTA INJUSTIFICADA' : 'ATRASO SEVERO'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRecordToJustify(record)}
                          className="w-full md:w-auto px-6 py-3 border border-uecg-line bg-gray-50 text-[10px] font-black uppercase tracking-widest text-uecg-dark hover:bg-uecg-dark hover:text-white transition-colors shadow-sm outline-none cursor-pointer"
                        >
                          Aplicar Licencia
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DRAWER DE JUSTIFICACIÓN */}
      <DrawerShell
        isOpen={!!recordToJustify}
        onClose={() => setRecordToJustify(null)}
        title="Emitir Licencia"
        kicker="Control de Asistencia"
        icon={<UserCheck className="w-5 h-5 text-white" />}
        headerVariant="blue"
        isSubmitting={justifyMutation.isPending}
        maxWidth="max-w-[450px]"
      >
        {recordToJustify && (
          <div className="flex flex-col h-full">
            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-zinc-900/50 flex flex-col gap-6">
              <div className="bg-white dark:bg-zinc-900 border border-uecg-line p-5 shadow-sm">
                <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest block mb-2 border-b border-uecg-line pb-2 select-none">
                  Información de la Infracción
                </span>
                <p className="text-sm font-black uppercase tracking-tight text-uecg-dark dark:text-zinc-100 mb-1">
                  {new Date(recordToJustify.date).toLocaleDateString('es-BO', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    timeZone: 'UTC',
                  })}
                </p>
                <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest">
                  {recordToJustify.classPeriod.name} ({recordToJustify.classPeriod.startTime})
                </p>
                <span
                  className={`inline-block mt-3 px-2 py-1 text-[9px] font-black uppercase tracking-widest border select-none ${
                    recordToJustify.status === 'ABSENT'
                      ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                      : 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/40'
                  }`}
                >
                  {recordToJustify.status === 'ABSENT' ? 'Falta Reportada' : 'Atraso Reportado'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="justification-textarea"
                  className="text-[10px] font-black uppercase tracking-widest text-uecg-gray flex items-center gap-1.5 select-none"
                >
                  <FileText className="w-4 h-4 text-uecg-blue" /> Respaldo / Motivo (Obligatorio)
                </label>
                <textarea
                  id="justification-textarea"
                  rows={5}
                  autoFocus
                  value={justificationText}
                  onChange={(e) => setJustificationText(e.target.value)}
                  disabled={justifyMutation.isPending}
                  className="w-full border-2 border-uecg-line bg-white dark:bg-zinc-800 p-4 text-[11px] font-black uppercase tracking-widest text-uecg-dark dark:text-zinc-100 outline-none focus:border-uecg-blue transition-colors shadow-inner resize-none disabled:opacity-50"
                  placeholder="EJ. CERTIFICADO MÉDICO CAJA NACIONAL #12345..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-uecg-line bg-white dark:bg-zinc-900 flex gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
              <button
                type="button"
                onClick={() => setRecordToJustify(null)}
                disabled={justifyMutation.isPending}
                className="flex-1 py-4 font-bold uppercase tracking-widest text-[11px] border border-uecg-line bg-gray-50 dark:bg-zinc-800 text-uecg-gray dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors outline-none shadow-sm disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() =>
                  justifyMutation.mutate({ id: recordToJustify.id, text: justificationText })
                }
                disabled={!justificationText.trim() || justifyMutation.isPending}
                className="flex-[2] py-4 font-black uppercase tracking-widest text-[11px] bg-uecg-dark text-white hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 outline-none cursor-pointer"
              >
                {justifyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {justifyMutation.isPending ? 'Procesando...' : 'Confirmar Licencia'}
              </button>
            </div>
          </div>
        )}
      </DrawerShell>
    </div>
  )
}
