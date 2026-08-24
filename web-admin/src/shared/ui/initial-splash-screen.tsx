import logoSvg from '@/assets/logo.svg';

interface InitialSplashScreenProps {
  message?: string;
}

export function InitialSplashScreen({
  message = 'INICIALIZANDO PLATAFORMA ESCOLAR...',
}: InitialSplashScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#0F4C81] text-white select-none p-6 font-sans antialiased overflow-hidden">
      {/* Subtle Swiss grid background pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-xl flex items-center justify-between border-b border-white/15 pb-4 pt-2">
        <span className="text-[10px] font-black tracking-[0.25em] uppercase text-blue-200">
          U.E.C.G. &bull; SUCRE, BOLIVIA
        </span>
        <span className="text-[9px] font-mono uppercase tracking-widest text-blue-300 bg-white/10 px-2 py-0.5 border border-white/20">
          ESTADO PLURINACIONAL
        </span>
      </header>

      {/* Center Content: Shield & Loading */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center my-auto max-w-md w-full px-4">
        {/* Shield Logo with white treatment */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-4 bg-white/10 rounded-full blur-xl animate-pulse pointer-events-none" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center bg-white/10 border-2 border-white/30 backdrop-blur-xs p-4 shadow-2xl">
            <img
              src={logoSvg}
              alt="Escudo Unidad Educativa Colegio Che Guevara"
              className="w-full h-full object-contain filter invert brightness-200 contrast-200 drop-shadow-md"
            />
          </div>
        </div>

        {/* Institution Title */}
        <h1 className="text-lg sm:text-xl font-black tracking-wider uppercase text-white leading-tight">
          Unidad Educativa Colegio Che Guevara
        </h1>
        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-blue-200 mt-2 mb-8">
          Sistema Integral de Gestión Académica
        </p>

        {/* Loading Indicator */}
        <div className="w-full max-w-xs space-y-3">
          <div className="w-full h-1 bg-white/20 overflow-hidden relative">
            <div className="h-full bg-white animate-[shimmer_1.5s_infinite_linear] w-1/3 absolute top-0 left-0"
              style={{
                animation: 'indeterminateProgress 1.6s ease-in-out infinite',
              }}
            />
          </div>
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 animate-pulse">
            {message}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-xl text-center border-t border-white/15 pt-4">
        <p className="text-[9px] tracking-widest uppercase text-blue-200 font-medium">
          Acreditación Legal RUE &bull; Ley 070 Avelino Siñani - Elizardo Pérez
        </p>
      </footer>

      {/* Embedded CSS for animation */}
      <style>{`
        @keyframes indeterminateProgress {
          0% { left: -35%; width: 35%; }
          50% { left: 40%; width: 50%; }
          100% { left: 100%; width: 35%; }
        }
      `}</style>
    </div>
  );
}
export default InitialSplashScreen;
