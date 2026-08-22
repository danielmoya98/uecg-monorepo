import { Lock } from 'lucide-react'

export const ClosedTrimesterWarning = () => (
  <div className="bg-red-50 border border-red-200 p-4 flex items-center justify-center gap-3" role="alert">
    <Lock className="w-5 h-5 text-red-600" />
    <p className="text-xs font-bold text-red-700 uppercase tracking-widest">
      Trimestre Cerrado: Edición deshabilitada (Solo lectura)
    </p>
  </div>
)
