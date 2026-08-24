import { AlertTriangle, CheckCircle, FileText } from "lucide-react";

interface DataUpdatesKPIsProps {
  pendingCount: number;
  isLoading?: boolean;
}

export const DataUpdatesKPIs = ({ pendingCount, isLoading = false }: DataUpdatesKPIsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-transparent">
      {/* KPI 1: Pendientes */}
      <div className="flex flex-col h-32 bg-yellow-50/50 border-l-4 border-l-yellow-500 border border-uecg-line p-5 shadow-sm hover:border-yellow-300 transition-all duration-200">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-800">
            En Revisión
          </span>
          <AlertTriangle className="text-yellow-600 w-5 h-5" strokeWidth={2.5} />
        </div>
        <div className="mt-auto flex items-end justify-between">
          {isLoading ? (
            <div className="h-10 w-16 bg-yellow-200 animate-pulse" />
          ) : (
            <span className="text-5xl font-black text-yellow-700 tracking-tighter leading-none">
              {pendingCount}
            </span>
          )}
          <span className="text-[9px] font-bold text-yellow-600 uppercase tracking-widest text-right max-w-[100px]">
            Solicitudes Pendientes
          </span>
        </div>
      </div>

      {/* KPI 2: Aprobados (Placeholder) */}
      <div className="flex flex-col h-32 bg-white border border-uecg-line p-5 shadow-sm relative overflow-hidden group hover:border-green-300 transition-all duration-200">
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-green-500 opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="flex justify-between items-start opacity-70">
          <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">
            Aprobados Hoy
          </span>
          <CheckCircle className="text-uecg-gray w-5 h-5" strokeWidth={2.5} />
        </div>
        <div className="mt-auto flex items-end justify-between opacity-70">
          <span className="text-5xl font-black text-uecg-dark tracking-tighter leading-none">--</span>
          <span className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest text-right max-w-[100px]">
            Expedientes Fusionados
          </span>
        </div>
      </div>

      {/* KPI 3: Físicos (Placeholder) */}
      <div className="flex flex-col h-32 bg-white border border-uecg-line p-5 shadow-sm relative overflow-hidden group hover:border-uecg-blue transition-all duration-200">
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-uecg-blue opacity-10 group-hover:opacity-25 transition-opacity"></div>
        <div className="flex justify-between items-start opacity-70">
          <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">
            Requieren Físico
          </span>
          <FileText className="text-uecg-gray w-5 h-5" strokeWidth={2.5} />
        </div>
        <div className="mt-auto flex items-end justify-between opacity-70">
          <span className="text-5xl font-black text-uecg-dark tracking-tighter leading-none">--</span>
          <span className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest text-right max-w-[100px]">
            Sin Contacto Digital
          </span>
        </div>
      </div>
    </div>
  );
};
export default DataUpdatesKPIs;
