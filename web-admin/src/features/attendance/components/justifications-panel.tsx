import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, FileText, CheckCircle, AlertTriangle, Loader2, Calendar, UserCheck, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useDebounce } from '@/shared/hooks/use-debounce'
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
        <div className="bg-white border border-uecg-line p-6 shadow-sm">
          <label
            htmlFor="student-search"
            className="text-[10px] font-black uppercase tracking-widest text-uecg-gray mb-3 flex items-center gap-2 select-none"
          >
            <span className="w-4 h-4 bg-uecg-dark text-white flex items-center justify-center font-mono text-[8px]">
              1
            </span>
            Buscar Estudiante
          </label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-uecg-gray group-focus-within:text-uecg-blue transition-colors" />
            <input
              id="student-search"
              type="text"
              placeholder="NOMBRE O CI..."
              autoComplete="off"
              className="w-full pl-11 pr-4 py-3 border border-uecg-line bg-gray-50 text-[11px] font-black uppercase tracking-widest outline-none focus:border-uecg-blue focus:bg-white transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mt-4 flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {isSearching && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin text-uecg-blue" />
              </div>
            )}
            {!isSearching && debouncedSearch.length > 2 && foundStudents.length === 0 && (
              <p className="text-[10px] text-center font-bold uppercase tracking-widest text-uecg-gray p-4 border border-dashed border-uecg-line select-none">
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
                      : 'border-uecg-line bg-white hover:border-uecg-blue hover:bg-blue-50/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <p
                    className={`text-[11px] font-black uppercase tracking-tight leading-none ${
                      isSelected ? 'text-white' : 'text-uecg-dark'
                    }`}
                  >
                    {enrollment.student.lastNamePaterno} {enrollment.student.names}
                  </p>
                  <p
                    className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${
                      isSelected ? 'text-blue-200' : 'text-uecg-gray'
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
          <div className="h-full border border-dashed border-uecg-line bg-white flex flex-col items-center justify-center text-uecg-gray min-h-[400px] shadow-sm select-none">
            <FileText className="w-16 h-16 mb-4 opacity-30" />
            <h3 className="text-lg font-black uppercase tracking-widest text-uecg-dark opacity-80">
              Auditoría de Infracciones
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2 text-center max-w-xs px-4">
              Seleccione un estudiante de la lista lateral para revisar sus faltas y atrasos pendientes de
              justificación.
            </p>
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

      {/* DRAWER DE JUSTIFICACIÓN (REACT PORTALS) */}
      {recordToJustify &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex justify-end pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <div
              className="absolute inset-0 bg-uecg-dark/60 backdrop-blur-sm transition-opacity duration-300 opacity-100"
              onClick={() => !justifyMutation.isPending && setRecordToJustify(null)}
            />

            <div className="relative h-full w-full max-w-[450px] border-l border-uecg-line bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between border-b p-6 relative overflow-hidden bg-uecg-blue border-uecg-blue/20 text-white shrink-0">
                <div className="absolute -left-8 -bottom-8 w-24 h-24 border-[4px] border-white opacity-10 rounded-none rotate-12 pointer-events-none" />

                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white text-uecg-blue flex items-center justify-center shadow-sm select-none">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-blue-100 uppercase tracking-widest block leading-none">
                      Tribunal Disciplinario
                    </span>
                    <h2
                      id="drawer-title"
                      className="text-xl font-black uppercase tracking-tighter mt-0.5 text-white"
                    >
                      Emitir Licencia
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRecordToJustify(null)}
                  disabled={justifyMutation.isPending}
                  className="p-1.5 relative z-10 text-white/50 hover:text-white transition-colors focus:outline-none bg-white/10 rounded-full hover:bg-white/20 cursor-pointer"
                  aria-label="Cerrar Cajón"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar bg-gray-50 flex flex-col gap-6">
                <div className="bg-white border border-uecg-line p-5 shadow-sm">
                  <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest block mb-2 border-b border-uecg-line pb-2 select-none">
                    Información de la Infracción
                  </span>
                  <p className="text-sm font-black uppercase tracking-tight text-uecg-dark mb-1">
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
                        ? 'text-red-700 bg-red-50 border-red-200'
                        : 'text-yellow-700 bg-yellow-50 border-yellow-200'
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
                    className="w-full border-2 border-uecg-line bg-white p-4 text-[11px] font-black uppercase tracking-widest text-uecg-dark outline-none focus:border-uecg-blue transition-colors shadow-inner resize-none disabled:opacity-50"
                    placeholder="EJ. CERTIFICADO MÉDICO CAJA NACIONAL #12345..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-uecg-line bg-white flex gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <button
                  type="button"
                  onClick={() => setRecordToJustify(null)}
                  disabled={justifyMutation.isPending}
                  className="flex-1 py-4 font-bold uppercase tracking-widest text-[11px] border border-uecg-line bg-gray-50 text-uecg-gray hover:bg-gray-100 transition-colors outline-none shadow-sm disabled:opacity-50 cursor-pointer"
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
          </div>,
          document.body,
        )}
    </div>
  )
}
