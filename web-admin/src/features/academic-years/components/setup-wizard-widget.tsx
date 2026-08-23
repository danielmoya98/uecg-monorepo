import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react'
import { useAcademicYearReadiness } from '../hooks/use-academic-years-data'

interface SetupWizardWidgetProps {
  academicYearId?: string
  className?: string
  onAction?: (stepId: string) => void
}

export function SetupWizardWidget({ academicYearId, className = '', onAction }: SetupWizardWidgetProps) {
  const navigate = useNavigate()
  const { data: readiness, isLoading, refetch, isFetching } = useAcademicYearReadiness(academicYearId)
  const [isExpanded, setIsExpanded] = useState(true)

  if (isLoading) {
    return (
      <div className={`border border-uecg-line bg-white p-6 animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 w-1/3 mb-4" />
        <div className="h-3 bg-gray-100 w-full mb-2" />
        <div className="h-10 bg-gray-50 w-full mt-4" />
      </div>
    )
  }

  if (!readiness) return null

  const { percentage, completedSteps, totalSteps, steps, academicYear } = readiness
  const isAllDone = percentage === 100

  return (
    <div
      className={`border-2 ${
        isAllDone ? 'border-emerald-500/40 bg-emerald-50/20' : 'border-uecg-blue/30 bg-white'
      } shadow-sm transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* HEADER DEL WIZARD */}
      <div className="p-5 md:p-6 border-b border-uecg-line bg-gray-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 flex items-center justify-center border font-black text-sm ${
              isAllDone
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'bg-uecg-dark text-white border-black'
            }`}
          >
            {isAllDone ? <Sparkles className="w-5 h-5" /> : `${percentage}%`}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-uecg-blue">
                Asistente de Configuración
              </span>
              {academicYear && (
                <span className="text-[9px] bg-gray-200 text-uecg-dark px-1.5 py-0.5 font-black uppercase tracking-widest">
                  Gestión {academicYear.year}
                </span>
              )}
            </div>
            <h2 className="text-base md:text-lg font-black uppercase tracking-tight text-uecg-text mt-0.5">
              {isAllDone
                ? '¡Gestión Escolar Lista al 100%!'
                : `Preparación del Ciclo Escolar (${completedSteps} de ${totalSteps} pasos listos)`}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 border border-uecg-line bg-white hover:bg-gray-100 text-uecg-gray transition-colors cursor-pointer"
            title="Actualizar diagnóstico"
            aria-label="Actualizar diagnóstico"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1.5 border border-uecg-line bg-white hover:bg-gray-100 text-uecg-text text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors"
          >
            {isExpanded ? (
              <>
                Ocultar Pasos <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Ver Pasos <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* BARRA DE PROGRESO */}
      <div className="w-full bg-gray-200 h-2 relative overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ease-out ${
            isAllDone ? 'bg-emerald-500' : 'bg-uecg-blue'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* LISTADO DE PASOS INTERACTIVOS */}
      {isExpanded && (
        <div className="p-4 md:p-6 divide-y divide-gray-100">
          {steps.map((step) => {
            const isCompleted = step.status === 'COMPLETED'
            const isInProgress = step.status === 'IN_PROGRESS'

            return (
              <div
                key={step.id}
                className={`py-3.5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                  isCompleted ? 'opacity-70 hover:opacity-100' : 'opacity-100'
                }`}
              >
                {/* LADO IZQUIERDO: ESTADO + TÍTULO */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isInProgress ? (
                      <AlertCircle className="w-5 h-5 text-amber-500 animate-pulse" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Paso {step.stepNumber}
                      </span>
                      <span
                        className={`text-[8px] font-black uppercase px-1.5 py-0.5 tracking-widest ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInProgress
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {isCompleted ? 'Completado' : isInProgress ? 'En Progreso' : 'Pendiente'}
                      </span>
                    </div>
                    <h3
                      className={`text-xs md:text-sm font-black tracking-tight mt-0.5 ${
                        isCompleted ? 'text-gray-700 line-through' : 'text-uecg-dark'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">{step.description}</p>
                    <p className="text-[10px] font-bold text-uecg-blue mt-1 uppercase tracking-wider">
                      {step.progressLabel}
                    </p>
                  </div>
                </div>

                {/* LADO DERECHO: CTA DE ACCIÓN */}
                <div className="shrink-0 pl-8 md:pl-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (onAction) {
                        onAction(step.id)
                      } else {
                        navigate({ to: step.actionUrl as any })
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                      isCompleted
                        ? 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                        : isInProgress
                          ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
                          : 'bg-uecg-dark text-white hover:bg-uecg-blue shadow-sm'
                    }`}
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
