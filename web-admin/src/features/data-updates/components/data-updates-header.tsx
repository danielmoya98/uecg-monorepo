import { RefreshCcw } from "lucide-react";

export const DataUpdatesHeader = () => {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-uecg-line pb-4 mt-2">
      <div>
        <span className="label-swiss text-[10px] text-uecg-gray uppercase tracking-widest font-black">
          Centro de Resoluciones
        </span>
        <h1 className="text-4xl mt-1 font-black tracking-tighter uppercase text-uecg-dark flex items-center gap-3">
          <RefreshCcw className="w-8 h-8 text-uecg-blue animate-in spin-in-12 duration-500" strokeWidth={3} />
          Actualizaciones RUDE
        </h1>
        <p className="text-[11px] font-bold text-uecg-gray tracking-widest uppercase mt-2 border border-uecg-line bg-gray-50 px-3 py-1.5 inline-block">
          Bandeja de entrada de formularios digitales enviados por los padres.
        </p>
      </div>
    </header>
  );
};
