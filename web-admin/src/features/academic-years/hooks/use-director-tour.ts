import { useCallback, useEffect } from 'react'
import { driver, type DriveStep } from 'driver.js'
import { useQuery } from '@tanstack/react-query'
import { AcademicYearsService } from '../api/academic-years.service'
import type { ReadinessStep } from '../types/academic-years.types'
import { useAppStore } from '@/shared/store/use-app-store'
import { useRouteContext } from '@tanstack/react-router'

export function useDirectorTour() {
  const { selectedYearId, selectedYear } = useAppStore()
  const { user } = useRouteContext({ from: '/_authenticated' })
  const isDirectorOrAdmin =
    user?.role === 'ADMINISTRADOR' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'DIRECTOR'

  const { data: wizardData, isLoading } = useQuery({
    queryKey: ['academicYearSetupWizard', selectedYearId],
    queryFn: () => AcademicYearsService.getReadiness(selectedYearId || undefined),
    staleTime: 60 * 1000,
    enabled: Boolean(isDirectorOrAdmin),
  })

  const startTour = useCallback(() => {
    if (!wizardData) return

    const percentage = wizardData.percentage ?? 0
    const stepsMap = (wizardData.steps || []).reduce<Record<string, ReadinessStep>>(
      (acc, step: ReadinessStep) => {
        acc[step.id] = step
        return acc
      },
      {}
    )

    const getBadgeHtml = (stepId: string) => {
      const step = stepsMap[stepId]
      if (!step) return ''
      if (step.status === 'COMPLETED') {
        return `<div class="tour-badge tour-badge-completed">✅ ${step.progressLabel || 'Completado'}</div>`
      }
      if (step.status === 'IN_PROGRESS') {
        return `<div class="tour-badge tour-badge-progress">⚠️ ${step.progressLabel || 'En Progreso'}</div>`
      }
      return `<div class="tour-badge tour-badge-pending">⏳ ${step.progressLabel || 'Pendiente'}</div>`
    }

    const isScratch = percentage === 0
    const isCompleted = percentage === 100

    const introHtml = `
      <div>
        <div class="tour-badge ${
          isCompleted
            ? 'tour-badge-completed'
            : isScratch
              ? 'tour-badge-pending'
              : 'tour-badge-progress'
        }">
          ${
            isCompleted
              ? '🎉 GESTIÓN 100% LISTA PARA OPERAR'
              : isScratch
                ? '🌱 GESTIÓN NUEVA (INICIA DESDE CERO)'
                : `⚡ PREPARACIÓN AL ${percentage}% (${wizardData.completedSteps || 0} de ${wizardData.totalSteps || 7} HITOS)`
          }
        </div>
        <p class="text-xs text-uecg-gray leading-relaxed mt-2">
          ${
            isCompleted
              ? `La gestión escolar <strong>${selectedYear || ''}</strong> tiene todos sus cursos, profesores y materias configurados.`
              : isScratch
                ? `Esta gestión no tiene registros previos. Te mostraremos paso a paso cómo estructurar el año escolar de forma rápida.`
                : `Te mostraremos qué pasos ya tienes completados y cuál es el siguiente hito para dejar el colegio operativo.`
          }
        </p>
      </div>
    `

    const tourSteps: DriveStep[] = [
      {
        element: '#tour-year-selector',
        popover: {
          title: '🏛️ Guía de Inicio: Gestión Escolar',
          description: introHtml,
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#tour-nav-academic-years',
        popover: {
          title: '1. Ciclo Lectivo y Trimestres',
          description: `
            <div>
              ${getBadgeHtml('academic_year')}
              <p class="text-xs text-uecg-gray leading-relaxed mt-1">
                Define las fechas de inicio y fin de la gestión, y configura los 3 trimestres oficiales según la normativa de la <strong>Ley 070</strong>.
              </p>
            </div>
          `,
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#tour-nav-classrooms',
        popover: {
          title: '2. Cursos y Paralelos',
          description: `
            <div>
              ${getBadgeHtml('classrooms')}
              <p class="text-xs text-uecg-gray leading-relaxed mt-1">
                Crea las aulas de Inicial, Primaria y Secundaria. Puedes crearlas individualmente o usar la herramienta de <strong>Clonar estructura del año anterior</strong>.
              </p>
            </div>
          `,
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#tour-nav-subjects',
        popover: {
          title: '3. Catálogo de Materias y Espacios',
          description: `
            <div>
              ${getBadgeHtml('catalog_spaces')}
              <p class="text-xs text-uecg-gray leading-relaxed mt-1">
                Verifica que las asignaturas oficiales (Matemáticas, Lenguaje, etc.) y los ambientes físicos (aulas, laboratorios) estén activos.
              </p>
            </div>
          `,
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#tour-nav-teacher-assignments',
        popover: {
          title: '4. Carga Horaria Docente',
          description: `
            <div>
              ${getBadgeHtml('teacher_assignments')}
              <p class="text-xs text-uecg-gray leading-relaxed mt-1">
                Asigna a los profesores responsables de cada materia por curso. Esto permite a los docentes ver sus listas de alumnos en su <strong>App Móvil y Web</strong>.
              </p>
            </div>
          `,
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#tour-nav-timetables',
        popover: {
          title: '5. Horarios Semanales',
          description: `
            <div>
              ${getBadgeHtml('timetables')}
              <p class="text-xs text-uecg-gray leading-relaxed mt-1">
                Arma la grilla de periodos de lunes a viernes. El sistema valida automáticamente que no existan cruces de docentes o aulas físicas.
              </p>
            </div>
          `,
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#tour-nav-enrollments',
        popover: {
          title: '6. Matriculación de Estudiantes',
          description: `
            <div>
              ${getBadgeHtml('enrollments')}
              <p class="text-xs text-uecg-gray leading-relaxed mt-1">
                Inscribe y asigna estudiantes a sus respectivos paralelos. Se puede realizar en ventanilla o mediante la <strong>Importación Masiva RUDE</strong>.
              </p>
            </div>
          `,
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#tour-nav-academic-years',
        popover: {
          title: '7. Apertura Oficial del 1er Trimestre',
          description: `
            <div>
              ${getBadgeHtml('first_trimester')}
              <p class="text-xs text-uecg-gray leading-relaxed mt-1">
                Al comenzar las clases, abre el <strong>1er Trimestre</strong> para que los docentes puedan registrar notas y pases de lista en tiempo real.
              </p>
            </div>
          `,
          side: 'right',
          align: 'start',
        },
      },
    ]

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 96, 0.4)',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: 'Entendido ✓',
      progressText: 'Hito {{current}} de {{total}}',
      steps: tourSteps,
      onDestroyStarted: () => {
        driverObj.destroy()
      },
    })

    driverObj.drive()
  }, [wizardData, selectedYear])

  // Chequeo de primera vez para el Director
  useEffect(() => {
    if (!wizardData || !isDirectorOrAdmin || !selectedYearId) return

    const storageKey = `uecg_tour_auto_shown_${selectedYearId}`
    const alreadyShown = localStorage.getItem(storageKey)

    // Si está en progreso y nunca se le mostró para esta gestión, sugerirlo
    if (!alreadyShown && wizardData.percentage < 100) {
      localStorage.setItem(storageKey, 'true')
      // Breve delay de hidratación del DOM
      const timer = setTimeout(() => {
        startTour()
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [wizardData, isDirectorOrAdmin, selectedYearId, startTour])

  return {
    startTour,
    wizardData,
    isLoading,
    isDirectorOrAdmin,
  }
}
