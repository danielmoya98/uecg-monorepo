import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, CheckCircle2, XCircle, User, BookOpenText } from 'lucide-react'
import { toast } from 'sonner'
import { DrawerShell } from '@/shared/ui/drawer-shell'
import { GradesService } from '../api/grades.service'

interface ChangeRequestsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

// Helper visual para las notas
interface ScoreBadgeProps {
  label: string
  oldScore: number | null
  newScore: number | null | undefined
}

const ScoreBadge = ({ label, oldScore, newScore }: ScoreBadgeProps) => {
  const changed = oldScore !== newScore && newScore !== null
  return (
    <div
      className={`border p-2 flex flex-col items-center ${
        changed ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20' : 'border-uecg-line bg-gray-50 dark:bg-zinc-900'
      }`}
    >
      <span className="text-[8px] font-black uppercase tracking-widest text-uecg-gray leading-none mb-1">
        {label}
      </span>
      <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
        <span className="text-uecg-gray line-through opacity-60">{oldScore ?? '-'}</span>
        {changed && <span className="font-bold text-uecg-blue">→</span>}
        <span className={`font-bold ${changed ? 'text-uecg-blue dark:text-blue-400' : 'text-uecg-dark dark:text-zinc-100'}`}>
          {newScore ?? oldScore ?? '-'}
        </span>
      </div>
    </div>
  )
}

export default function ChangeRequestsDrawer({ isOpen, onClose }: ChangeRequestsDrawerProps) {
  const queryClient = useQueryClient()

  // 1. QUERY: Obtener solicitudes pendientes
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['pending-grade-change-requests'],
    queryFn: GradesService.getPendingRequests,
    enabled: isOpen,
  })

  // 2. MUTATION: Resolver Solicitud
  const resolveMutation = useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: string
      status: 'APPROVED' | 'REJECTED'
    }) => GradesService.resolveChangeRequest(requestId, status),
    onSuccess: (_data: any, variables) => {
      toast.success(
        variables.status === 'APPROVED'
          ? 'SOLICITUD APROBADA CORRECTAMENTE'
          : 'SOLICITUD RECHAZADA',
        {
          description: `Se procesó la solicitud exitosamente.`,
        },
      )
      queryClient.invalidateQueries({ queryKey: ['pending-grade-change-requests'] })
      queryClient.invalidateQueries({ queryKey: ['gradebook'] })
    },
    onError: (err: any) => {
      toast.error('ERROR AL PROCESAR LA SOLICITUD', {
        description: err.response?.data?.message || err.message,
      })
    },
  })


  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitudes de Corrección"
      kicker="Bandeja de Entrada"
      icon={<BookOpenText className="w-5 h-5 text-white" />}
      headerVariant="default"
      isSubmitting={resolveMutation.isPending}
      maxWidth="max-w-2xl"
    >
      {/* Contenido con scrollable */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-6" tabIndex={0}>
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-uecg-gray p-12 bg-white border border-uecg-line">
            <Loader2 className="w-8 h-8 animate-spin text-uecg-blue" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Sincronizando con el servidor...
            </span>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-12 bg-white border border-uecg-line shadow-sm">
            <CheckCircle2
              className="w-16 h-16 text-green-400 opacity-50"
              strokeWidth={1}
            />
            <h3 className="text-lg font-black uppercase tracking-tight text-uecg-dark">
              Todo al día, Director
            </h3>
            <p className="text-xs font-bold uppercase tracking-widest text-uecg-gray border border-uecg-line bg-gray-50 px-3 py-1.5">
              No hay solicitudes de descongelamiento pendientes.
            </p>
          </div>
        ) : (
          requests.map((req) => {
            const grade = req.grade
            const newSer = req.proposedSer ?? grade.scoreSer
            const newSaber = req.proposedSaber ?? grade.scoreSaber
            const newHacer = req.proposedHacer ?? grade.scoreHacer
            const newAuto = req.proposedAuto ?? grade.scoreAuto

            const totalScore =
              (newSer || 0) + (newSaber || 0) + (newHacer || 0) + (newAuto || 0)

            let finalScore = totalScore
            const recoveryScore = grade.recoveryScore
            let recoveryTag: string

            if (totalScore >= 51) {
              recoveryTag = 'APROBADO (SIN REC.)'
            } else if (recoveryScore !== null) {
              finalScore = Math.min(recoveryScore, 51)
              recoveryTag = `REC. APLICADA (MÁX 51)`
            } else {
              finalScore = totalScore
              recoveryTag = 'REPROBADO (ESPERANDO REC.)'
            }

            const isMutating =
              resolveMutation.isPending &&
              resolveMutation.variables?.requestId === req.id

            return (
              <div
                key={req.id}
                className="bg-white border-2 border-uecg-dark dark:border-zinc-700 p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative flex flex-col gap-4"
              >
                {/* Sub-Header Tarjeta */}
                <div className="flex justify-between items-start border-b border-uecg-line pb-3 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-uecg-gray uppercase">
                      {new Date(req.createdAt)
                        .toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        .replace(',', ' -')
                        .toUpperCase()}
                    </span>
                    <h4 className="text-sm font-black uppercase tracking-tight text-uecg-dark mt-0.5">
                      {grade.enrollment.student.lastNamePaterno}{' '}
                      {grade.enrollment.student.lastNameMaterno}{' '}
                      {grade.enrollment.student.names}
                    </h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-uecg-blue mt-1 bg-blue-50 px-2 py-0.5 border border-blue-100 inline-block w-max">
                      Materia: {grade.teacherAssignment.subject.name} |{' '}
                      {grade.trimester.name.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0 text-right">
                    <div className="flex items-center gap-1.5 text-uecg-gray">
                      <User className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Solicitante:
                      </span>
                    </div>
                    <span className="text-xs font-black uppercase text-uecg-dark">
                      Prof. {grade.teacherAssignment.teacher.fullName}
                    </span>
                  </div>
                </div>

                {/* Comparación de Notas */}
                <div className="grid grid-cols-5 gap-2">
                  <ScoreBadge
                    label="SER /10"
                    oldScore={grade.scoreSer}
                    newScore={req.proposedSer}
                  />
                  <ScoreBadge
                    label="SABER /45"
                    oldScore={grade.scoreSaber}
                    newScore={req.proposedSaber}
                  />
                  <ScoreBadge
                    label="HACER /40"
                    oldScore={grade.scoreHacer}
                    newScore={req.proposedHacer}
                  />
                  <ScoreBadge
                    label="AUTO /5"
                    oldScore={grade.scoreAuto}
                    newScore={req.proposedAuto}
                  />

                  <div className="border-2 border-uecg-dark bg-uecg-dark text-white p-2 flex flex-col items-center justify-center">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">
                      FINAL /100
                    </span>
                    <div className="flex items-center gap-1 font-mono tabular-nums">
                      <span className="text-xs line-through opacity-50">
                        {grade.finalScore ?? '-'}
                      </span>
                      <span className="text-xs font-black text-yellow-300">→</span>
                      <span
                        className={`text-sm font-black ${
                          finalScore < 51 ? 'text-red-300' : 'text-green-300'
                        }`}
                      >
                        {finalScore}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[9px] font-bold text-uecg-gray uppercase tracking-wider">
                  Estado proyectado: <span className="text-uecg-dark">{recoveryTag}</span>
                </div>

                {/* Justificación del Profesor */}
                <div className="bg-black text-[#00FF88] font-mono p-4 border-2 border-uecg-dark text-[11px] leading-relaxed relative">
                  <span className="absolute top-2 right-3 text-[9px] text-uecg-gray">
                    JUSTIFICACIÓN_DOCENTE_RAW
                  </span>
                  <span className="text-uecg-gray">$ cat motivo_correccion.txt</span>
                  <br />
                  &gt; "{req.reason}"
                </div>

                {/* Botones de Acción */}
                <div className="border-t border-uecg-line pt-4 mt-1 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      resolveMutation.mutate({
                        requestId: req.id,
                        status: 'REJECTED',
                      })
                    }
                    disabled={isMutating}
                    className="flex items-center justify-center gap-2.5 py-3 border-2 border-uecg-dark text-[10px] font-black uppercase tracking-widest text-uecg-dark bg-white hover:bg-gray-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uecg-blue cursor-pointer"
                  >
                    {isMutating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    Rechazar Solicitud
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      resolveMutation.mutate({
                        requestId: req.id,
                        status: 'APPROVED',
                      })
                    }
                    disabled={isMutating}
                    className="flex items-center justify-center gap-2.5 py-3 border-2 border-uecg-dark text-[10px] font-black uppercase tracking-widest text-white bg-green-600 hover:bg-green-700 transition-colors shadow-[4px_4px_0px_0px_#166534] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uecg-blue cursor-pointer"
                  >
                    {isMutating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Aprobar Cambios
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </DrawerShell>
  )
}
