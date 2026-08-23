import { Compass } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AcademicYearsService, useTourStore } from '@/features/academic-years'
import { useAppStore } from '@/shared/store/use-app-store'
import { useRouteContext } from '@tanstack/react-router'

export default function DirectorTourButton() {
  const { selectedYearId } = useAppStore()
  const { user } = useRouteContext({ from: '/_authenticated' })
  const { startTour, resetTourForYear } = useTourStore()

  const isDirectorOrAdmin =
    user?.role === 'ADMINISTRADOR' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'DIRECTOR'

  const { data: wizardData } = useQuery({
    queryKey: ['academicYearSetupWizard', selectedYearId],
    queryFn: () => AcademicYearsService.getReadiness(selectedYearId || undefined),
    staleTime: 30 * 1000,
    enabled: Boolean(isDirectorOrAdmin && selectedYearId),
  })

  if (!isDirectorOrAdmin || !wizardData) return null

  const percentage = wizardData.percentage ?? 0
  const isCompleted = percentage === 100

  const handleTriggerTour = () => {
    if (selectedYearId) {
      resetTourForYear(selectedYearId)
    } else {
      startTour(0)
    }
  }

  return (
    <button
      type="button"
      onClick={handleTriggerTour}
      className={`hidden lg:flex items-center gap-2 px-3 py-1.5 border transition-all text-left cursor-pointer focus:outline-none ${
        isCompleted
          ? 'border-green-200 bg-green-50/70 text-green-800 hover:bg-green-100'
          : 'border-blue-200 bg-blue-50/70 text-uecg-blue hover:bg-blue-100/80 shadow-sm'
      }`}
      title="Iniciar o reiniciar tour interactivo de preparación de la gestión escolar"
    >
      <Compass className="w-3.5 h-3.5 shrink-0 text-uecg-blue" />
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">
          Guía de Gestión
        </span>
        <span
          className={`text-[8px] font-black uppercase px-1.5 py-0.5 leading-none ${
            isCompleted
              ? 'bg-green-600 text-white'
              : 'bg-uecg-blue text-white'
          }`}
        >
          {percentage}%
        </span>
      </div>
    </button>
  )
}
