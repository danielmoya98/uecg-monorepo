import { Compass } from 'lucide-react'
import { useDirectorTour } from '@/features/academic-years'

export default function DirectorTourButton() {
  const { startTour, wizardData, isDirectorOrAdmin } = useDirectorTour()

  if (!isDirectorOrAdmin || !wizardData) return null

  const percentage = wizardData.percentage ?? 0
  const isCompleted = percentage === 100

  return (
    <button
      type="button"
      onClick={() => startTour()}
      className={`hidden lg:flex items-center gap-2 px-3 py-1.5 border transition-all text-left cursor-pointer focus:outline-none ${
        isCompleted
          ? 'border-green-200 bg-green-50/70 text-green-800 hover:bg-green-100'
          : 'border-blue-200 bg-blue-50/70 text-uecg-blue hover:bg-blue-100/80 shadow-sm'
      }`}
      title="Iniciar tour interactivo de preparación de la gestión escolar"
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
