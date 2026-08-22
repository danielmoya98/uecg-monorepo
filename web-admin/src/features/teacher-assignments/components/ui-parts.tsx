import { AlertTriangle, CalendarRange } from 'lucide-react'

interface HeaderProps {
  year: number | string
  canManage: boolean
}

export const AssignmentsHeader = ({ year, canManage }: HeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-uecg-line p-6 relative overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Patrones de fondo suizos */}
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gray-50 -skew-x-12 pointer-events-none border-l border-uecg-line"></div>
      <div className="absolute -right-8 -top-8 w-20 h-20 border-4 border-uecg-line opacity-20 rounded-none rotate-45 pointer-events-none"></div>

      <div className="relative z-10 flex items-start gap-4">
        <div className="w-12 h-12 bg-uecg-dark text-white flex items-center justify-center shadow-md shrink-0">
          <CalendarRange className="w-6 h-6 text-uecg-blue" />
        </div>
        <div>
          <span className="label-swiss !mb-0 text-[10px]">Gestión Académica</span>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-uecg-dark">
            Carga Horaria
          </h1>
          <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest mt-1">
            Asignación de materias y plantel docente para la gestión escolar.
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black text-uecg-gray uppercase tracking-widest leading-none">
            Periodo Activo
          </span>
          <span className="text-lg font-black text-uecg-blue tracking-tighter mt-1">
            G-{year}
          </span>
        </div>
        <div className="w-px h-8 bg-uecg-line"></div>
        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border ${
          canManage
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          {canManage ? 'Editor' : 'Lector'}
        </span>
      </div>
    </div>
  )
}

export const NoActiveYearAlert = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-yellow-200 bg-yellow-50/50 shadow-sm max-w-2xl mx-auto my-12 animate-in zoom-in-95">
      <AlertTriangle className="w-16 h-16 text-yellow-600 mb-4" strokeWidth={1.5} />
      <h2 className="text-lg font-black uppercase tracking-widest text-yellow-900">
        Sin Gestión Activa
      </h2>
      <p className="text-[11px] font-bold text-yellow-700 uppercase tracking-widest mt-3 max-w-md leading-relaxed">
        No se ha detectado ninguna gestión escolar en estado "ACTIVO". Configure y active un año académico en el panel de Gestión Académica para poder administrar la carga horaria.
      </p>
    </div>
  )
}
