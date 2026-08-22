import { Terminal, ActivitySquare, Server, RefreshCw } from "lucide-react";

interface AuditHeaderProps {
  isFetching: boolean;
}

export const AuditHeader = ({ isFetching }: AuditHeaderProps) => (
  <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-uecg-line pb-4 mt-2">
    <div>
      <span className="label-swiss !text-[10px] flex items-center gap-1.5">
        <Terminal className="w-3.5 h-3.5" /> Trazabilidad del Sistema
      </span>
      <h1 className="text-4xl mt-1 font-black tracking-tighter uppercase text-uecg-dark flex items-center gap-3">
        <ActivitySquare className="w-8 h-8 text-uecg-blue" />
        Auditoría Global
      </h1>
    </div>

    {/* Badge estilo Terminal, adaptado a la sombra corporativa con loader activo */}
    <div className="hidden md:flex items-center gap-3 bg-uecg-dark text-[#00FF88] px-4 py-3 shadow-sm border border-uecg-dark transition-all duration-200">
      {isFetching ? (
        <RefreshCw className="w-4 h-4 animate-spin text-[#00FF88]" />
      ) : (
        <Server className="w-4 h-4 animate-pulse" />
      )}
      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
        {isFetching ? "Sincronizando logs..." : "Monitor de Interceptores Activo"}
      </span>
      {isFetching && (
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF88]"></span>
        </span>
      )}
    </div>
  </header>
);
