import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useRouteContext } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { driver, type Driver } from 'driver.js'
import { useTourStore } from '../store/use-tour-store'
import { DIRECTOR_TOUR_STEPS } from '../constants/tour-steps'
import { AcademicYearsService } from '../api/academic-years.service'
import { useAppStore } from '@/shared/store/use-app-store'
import type { ReadinessStep } from '../types/academic-years.types'

export function TourOrchestrator() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useRouteContext({ from: '/_authenticated' })
  const { selectedYearId, selectedYear } = useAppStore()

  const isDirectorOrAdmin =
    user?.role === 'ADMINISTRADOR' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'DIRECTOR'

  const {
    isActive,
    currentStepIndex,
    completedYears,
    dismissedYears,
    startTour,
    nextStep,
    prevStep,
    endTour,
    completeTourForYear,
    dismissTourForYear,
  } = useTourStore()

  const { data: wizardData } = useQuery({
    queryKey: ['academicYearSetupWizard', selectedYearId],
    queryFn: () => AcademicYearsService.getReadiness(selectedYearId || undefined),
    staleTime: 30 * 1000,
    enabled: Boolean(isDirectorOrAdmin && selectedYearId),
  })

  const driverRef = useRef<Driver | null>(null)
  const isNavigatingRef = useRef(false)

  // 1. Detección Inteligente y Auto-Inicio
  useEffect(() => {
    if (!isDirectorOrAdmin || !selectedYearId || !wizardData || isActive) return

    // Si ya está 100% completado en la BD, marcar como completado
    if (wizardData.percentage === 100) {
      if (!completedYears[selectedYearId]) {
        completeTourForYear(selectedYearId)
      }
      return
    }

    // Si aún no está al 100% y no ha sido omitido o completado
    const isCompleted = completedYears[selectedYearId]
    const isDismissed = dismissedYears[selectedYearId]

    if (!isCompleted && !isDismissed) {
      // Buscar el primer paso pendiente en la base de datos
      const stepsMap = (wizardData.steps || []).reduce<Record<string, ReadinessStep>>(
        (acc, s: ReadinessStep) => {
          acc[s.id] = s
          return acc
        },
        {}
      )

      let firstPendingIndex = 1
      for (let i = 1; i < DIRECTOR_TOUR_STEPS.length; i++) {
        const cfg = DIRECTOR_TOUR_STEPS[i]
        const dbStep = stepsMap[cfg.id]
        if (dbStep && dbStep.status !== 'COMPLETED') {
          firstPendingIndex = i
          break
        }
      }

      // Si no hay nada creado (0%), empezar desde la introducción
      const startIndex = wizardData.percentage === 0 ? 0 : firstPendingIndex
      startTour(startIndex)
    }
  }, [
    isDirectorOrAdmin,
    selectedYearId,
    wizardData,
    isActive,
    completedYears,
    dismissedYears,
    startTour,
    completeTourForYear,
  ])

  // 2. Orquestador de Pasos y Navegación Multi-Página
  useEffect(() => {
    if (!isActive) {
      if (driverRef.current) {
        driverRef.current.destroy()
        driverRef.current = null
      }
      return
    }

    const currentConfig = DIRECTOR_TOUR_STEPS[currentStepIndex]
    if (!currentConfig) {
      if (selectedYearId) completeTourForYear(selectedYearId)
      return
    }

    // Si el paso requiere estar en otra ruta, navegar primero
    if (location.pathname !== currentConfig.route) {
      isNavigatingRef.current = true
      navigate({ to: currentConfig.route as any }).then(() => {
        isNavigatingRef.current = false
      })
      return
    }

    // Ya estamos en la ruta correcta: buscar el elemento y montar Driver.js
    let attempts = 0
    const maxAttempts = 15

    const mountStepDriver = () => {
      const targetEl =
        document.querySelector(currentConfig.selector) ||
        document.querySelector(currentConfig.fallbackSelector) ||
        document.querySelector('#tour-year-selector')

      if (!targetEl && attempts < maxAttempts) {
        attempts++
        setTimeout(mountStepDriver, 150)
        return
      }

      if (!targetEl) return

      if (driverRef.current) {
        driverRef.current.destroy()
      }

      const stepsMap = (wizardData?.steps || []).reduce<Record<string, ReadinessStep>>(
        (acc, s: ReadinessStep) => {
          acc[s.id] = s
          return acc
        },
        {}
      )

      const dbStep = stepsMap[currentConfig.id]
      const statusBadge = dbStep
        ? dbStep.status === 'COMPLETED'
          ? `<div class="tour-badge tour-badge-completed">✅ ${dbStep.progressLabel || 'Hito Completado'}</div>`
          : dbStep.status === 'IN_PROGRESS'
            ? `<div class="tour-badge tour-badge-progress">⚠️ ${dbStep.progressLabel || 'En Progreso'}</div>`
            : `<div class="tour-badge tour-badge-pending">⏳ ${dbStep.progressLabel || 'Pendiente de Configuración'}</div>`
        : ''

      const isFirst = currentStepIndex === 0
      const isLast = currentStepIndex === DIRECTOR_TOUR_STEPS.length - 1

      const actionBtnHtml = currentConfig.actionButtonSelector
        ? `
          <div class="mt-3 pt-2 border-t border-uecg-line">
            <button
              id="tour-action-trigger-btn"
              type="button"
              class="w-full py-2 px-3 text-[10px] font-black uppercase tracking-wider bg-blue-50 text-uecg-blue border border-blue-200 hover:bg-uecg-blue hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              👉 ${currentConfig.actionButtonLabel || 'Abrir Formulario'}
            </button>
          </div>
        `
        : ''

      const popoverHtml = `
        <div>
          ${statusBadge}
          <p class="text-xs text-uecg-gray leading-relaxed mt-1">
            ${currentConfig.description}
          </p>
          <div class="mt-2 text-[10px] font-bold text-uecg-blue bg-blue-50/50 p-2 border-l-2 border-uecg-blue">
            💡 <strong>Paso a seguir:</strong> ${currentConfig.actionHint}
          </div>
          ${actionBtnHtml}
        </div>
      `

      const d = driver({
        animate: true,
        allowClose: true,
        overlayColor: 'rgba(0, 0, 96, 0.45)',
        nextBtnText: isLast ? 'Finalizar Guía ✓' : 'Siguiente Paso →',
        prevBtnText: isFirst ? '' : '← Anterior',
        showProgress: true,
        progressText: `Hito ${currentStepIndex} de ${DIRECTOR_TOUR_STEPS.length - 1}`,
        steps: [
          {
            element: targetEl as HTMLElement,
            popover: {
              title: currentConfig.title,
              description: popoverHtml,
              side: 'bottom',
              align: 'start',
              onNextClick: () => {
                d.destroy()
                if (isLast) {
                  if (selectedYearId) completeTourForYear(selectedYearId)
                } else {
                  nextStep()
                }
              },
              onPrevClick: () => {
                d.destroy()
                prevStep()
              },
              onCloseClick: () => {
                d.destroy()
                if (selectedYearId) dismissTourForYear(selectedYearId)
                endTour()
              },
            },
          },
        ],
        onDestroyStarted: () => {
          // Si el usuario cierra con ESC o click afuera
          d.destroy()
        },
      })

      driverRef.current = d
      d.drive()

      // Añadir evento al botón de acción dentro del tooltip
      setTimeout(() => {
        const actionBtn = document.getElementById('tour-action-trigger-btn')
        if (actionBtn && currentConfig.actionButtonSelector) {
          actionBtn.onclick = () => {
            const realBtn = document.querySelector(
              currentConfig.actionButtonSelector!
            ) as HTMLElement
            if (realBtn) {
              realBtn.click()
            }
          }
        }
      }, 100)
    }

    const timer = setTimeout(mountStepDriver, 200)
    return () => {
      clearTimeout(timer)
      if (driverRef.current) {
        driverRef.current.destroy()
        driverRef.current = null
      }
    }
  }, [
    isActive,
    currentStepIndex,
    location.pathname,
    navigate,
    selectedYearId,
    selectedYear,
    wizardData,
    nextStep,
    prevStep,
    endTour,
    completeTourForYear,
    dismissTourForYear,
  ])

  return null
}
