import { Loader2 } from 'lucide-react'

export function RoutePendingIndicator() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none">
      {/* Barra superior de progreso ultra-ligera */}
      <div className="w-full h-1 bg-uecg-line/30 overflow-hidden relative">
        <div
          className="h-full bg-uecg-blue absolute top-0 left-0"
          style={{
            animation: 'routeProgressBar 1.2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Badge sutil flotante en la esquina inferior derecha si la carga toma tiempo */}
      <div className="fixed bottom-6 right-6 z-[99999] pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="bg-uecg-dark text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-2 shadow-2xl border border-white/20 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-uecg-blue" />
          <span>Cargando módulo...</span>
        </div>
      </div>

      <style>{`
        @keyframes routeProgressBar {
          0% { left: -30%; width: 30%; }
          50% { left: 35%; width: 45%; }
          100% { left: 100%; width: 30%; }
        }
      `}</style>
    </div>
  )
}
export default RoutePendingIndicator
