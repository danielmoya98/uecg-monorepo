import { useQuery } from "@tanstack/react-query";
import { History, Loader2, ShieldAlert, CheckCircle } from "lucide-react";
import { ProfileService } from "../api/profile.service";

export function SecurityLogsTable() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["personal-security-logs"],
    queryFn: ProfileService.getSecurityLogs,
  });

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[9px] uppercase">
          <CheckCircle className="w-3 h-3" /> Exitoso ({statusCode})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-red-600 font-bold text-[9px] uppercase">
        <ShieldAlert className="w-3 h-3" /> Bloqueado ({statusCode})
      </span>
    );
  };

  return (
    <section className="bg-white border border-uecg-line p-6 shadow-sm flex flex-col gap-4">
      <div className="border-b border-uecg-line pb-3">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-uecg-blue flex items-center gap-2">
          <History className="w-3.5 h-3.5" /> Historial de Actividad y Accesos Recientes
        </h2>
      </div>

      {isLoading ? (
        <div className="py-6 flex items-center justify-center text-xs text-uecg-gray gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-uecg-blue" />
          <span>Cargando registros...</span>
        </div>
      ) : logs.length === 0 ? (
        <p className="text-xs text-uecg-gray py-4 text-center">
          No hay actividad reciente registrada en esta cuenta.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-uecg-line bg-gray-50 text-[9px] font-black uppercase tracking-widest text-uecg-gray">
                <th className="py-2.5 px-3">Fecha y Hora</th>
                <th className="py-2.5 px-3">Acción / Ruta</th>
                <th className="py-2.5 px-3">IP / Origen</th>
                <th className="py-2.5 px-3 text-right">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-uecg-line">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[10px] text-uecg-dark whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("es-BO")}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-[10px] text-uecg-dark">
                      {log.method}
                    </span>{" "}
                    <span className="font-mono text-[10px] text-uecg-gray">
                      {log.route}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-uecg-gray whitespace-nowrap">
                    {log.ipAddress || "Local"}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    {getStatusBadge(log.statusCode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
