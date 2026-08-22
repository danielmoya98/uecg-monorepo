import { Inbox, ShieldAlert } from "lucide-react";
import type { DataUpdateRequest } from "../types/data-updates.types";

interface DataUpdatesTableProps {
  requests: DataUpdateRequest[];
  isLoading: boolean;
  onAudit: (request: DataUpdateRequest) => void;
  canManage: boolean; // 🔥 Propiedad ABAC inyectada
}

export const DataUpdatesTable = ({
  requests,
  isLoading,
  onAudit,
  canManage,
}: DataUpdatesTableProps) => {
  const columnCount = canManage ? 4 : 3;

  return (
    <div className="border border-uecg-line bg-white overflow-x-auto shadow-sm">
      <table className="w-full text-left whitespace-nowrap border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-gray-50 border-b border-uecg-line">
            <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Fecha Recepción
            </th>
            <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Estudiante Solicitante
            </th>
            <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Ubicación Académica
            </th>
            {/* 🔥 ESCUDO: Ocultar columna si no es gestor */}
            {canManage && (
              <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray text-center w-32">
                Acción
              </th>
            )}
          </tr>
        </thead>
        <tbody className={`transition-opacity duration-200 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-uecg-line animate-pulse">
                <td className="px-4 py-4 border-r border-uecg-line">
                  <div className="h-3 w-24 bg-gray-200"></div>
                </td>
                <td className="px-4 py-4 border-r border-uecg-line">
                  <div className="h-3 w-40 bg-gray-200 mb-2"></div>
                  <div className="h-2 w-24 bg-gray-100"></div>
                </td>
                <td className="px-4 py-4 border-r border-uecg-line">
                  <div className="h-4 w-24 bg-gray-200"></div>
                </td>
                {canManage && (
                  <td className="px-4 py-4">
                    <div className="h-8 w-20 bg-gray-200 mx-auto"></div>
                  </td>
                )}
              </tr>
            ))
          ) : requests.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="p-0">
                <div className="flex flex-col items-center justify-center py-20 opacity-80 animate-in fade-in zoom-in-95">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-uecg-line rounded-none rotate-12"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 bg-gray-100 -rotate-12"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 shadow-sm border border-uecg-line">
                      <Inbox className="w-6 h-6 text-uecg-gray" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="font-black uppercase tracking-widest text-xs text-uecg-dark mb-1">
                    Bandeja Limpia
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-uecg-gray">
                    No hay actualizaciones de datos pendientes por revisar.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            requests.map((req, index) => {
              const student = req.enrollment?.student;
              const classroom = req.enrollment?.classroom;
              return (
                <tr
                  key={req.id}
                  className="border-b border-uecg-line hover:bg-blue-50/30 transition-colors group animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-4 py-4 border-r border-uecg-line text-[11px] font-bold text-uecg-gray tracking-widest uppercase">
                    {new Date(req.createdAt).toLocaleString("es-BO", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-4 border-r border-uecg-line">
                    <p className="font-black uppercase tracking-tight text-sm text-uecg-dark">
                      {student?.names || ""} {student?.lastNamePaterno || ""}
                    </p>
                    <p className="text-[10px] font-bold text-uecg-blue uppercase tracking-widest mt-0.5 bg-blue-50 px-2 py-0.5 inline-block border border-blue-100">
                      CI: {student?.ci || "S/N"}
                    </p>
                  </td>
                  <td className="px-4 py-4 border-r border-uecg-line">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1.5 bg-gray-50 text-uecg-dark border border-uecg-line shadow-sm">
                      {classroom?.grade || "S/N"} "{classroom?.section || ""}" — {classroom?.level || "S/N"}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => onAudit(req)}
                        className="px-6 py-3 font-black uppercase tracking-widest text-[10px] border border-uecg-blue bg-white text-uecg-blue hover:bg-uecg-blue hover:text-white transition-colors shadow-sm w-full flex items-center justify-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-uecg-blue"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" /> Auditar
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
export default DataUpdatesTable;
