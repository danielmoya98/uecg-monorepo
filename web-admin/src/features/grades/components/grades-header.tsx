import { GraduationCap, BellDot } from 'lucide-react'

interface GradesHeaderProps {
  canManageGrades: boolean
  pendingRequestsCount: number
  onOpenRequests: () => void
}

export const GradesHeader = ({
  canManageGrades,
  pendingRequestsCount,
  onOpenRequests,
}: GradesHeaderProps) => (
  <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-uecg-line pb-4 mt-2">
    <div>
      <span className="text-[10px] text-uecg-blue uppercase tracking-widest font-black">
        {canManageGrades ? 'Supervisión Académica' : 'Panel Docente'}
      </span>
      <h1 className="text-4xl mt-1 font-black tracking-tighter uppercase text-uecg-dark flex items-center gap-3">
        <GraduationCap className="w-8 h-8 text-uecg-blue" /> Planillas de Calificación
      </h1>
    </div>

    {canManageGrades && (
      <button
        type="button"
        onClick={onOpenRequests}
        className="relative flex items-center gap-2.5 px-5 py-3.5 border-2 border-uecg-dark text-uecg-dark bg-white hover:bg-uecg-dark hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 outline-none group"
      >
        <BellDot
          className={`w-5 h-5 ${
            pendingRequestsCount > 0
              ? 'text-red-600 animate-pulse'
              : 'text-uecg-gray group-hover:text-white'
          }`}
          strokeWidth={2.5}
        />
        <span className="text-[10px] font-black uppercase tracking-widest">
          Solicitudes de Cambio
        </span>
        {pendingRequestsCount > 0 && (
          <div className="absolute -top-2.5 -right-2.5 bg-red-600 text-white font-black font-mono text-[10px] w-6 h-6 flex items-center justify-center border-2 border-uecg-dark shadow-sm">
            {pendingRequestsCount}
          </div>
        )}
      </button>
    )}
  </header>
)
