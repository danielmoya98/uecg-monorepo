import { Terminal, Server, RefreshCw } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";

interface AuditHeaderProps {
  isFetching?: boolean;
}

export const AuditHeader = ({ isFetching = false }: AuditHeaderProps) => (
  <PageHeader
    kicker="TRAZABILIDAD DEL SISTEMA"
    kickerIcon={Terminal}
    title="Auditoría Global"
    description="Registro inmutable de transacciones, mutaciones de datos y eventos de seguridad."
  >
    {/* Badge estilo Terminal con loader activo */}
    <div className="flex items-center gap-3 bg-uecg-dark text-[#00FF88] px-5 py-4 shadow-sm border border-uecg-dark select-none">
      {isFetching ? (
        <RefreshCw className="w-4 h-4 animate-spin text-[#00FF88]" />
      ) : (
        <Server className="w-4 h-4 animate-pulse" />
      )}
      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
        {isFetching ? "Sincronizando logs..." : "Monitor Activo"}
      </span>
      {isFetching && (
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF88]"></span>
        </span>
      )}
    </div>
  </PageHeader>
);

