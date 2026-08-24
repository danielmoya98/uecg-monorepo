import { Check, Loader2, Printer, X } from "lucide-react";
import { SwissEmptyState } from "@/shared/ui";

interface EnrollmentsGridProps {
  enrollments: any[];
  isPending: boolean;
  isFetching: boolean;
  generatingPdfId: string | null;
  onPrint: (id: string) => void;
  onApprove: (enrollment: any) => void;
  onReject: (id: string) => void;
  canManage: boolean;
}

const getBadgeStyles = (type: string) => {
  if (type === "NUEVO") return "bg-uecg-dark text-white border-uecg-dark dark:bg-zinc-800 dark:border-zinc-700";
  if (type === "TRASPASO") return "bg-yellow-500 text-white border-yellow-500";
  return "bg-uecg-blue text-white border-uecg-blue dark:bg-blue-600";
};

const getLabelStyles = (type: string) => {
  if (type === "NUEVO") return "bg-gray-100 dark:bg-zinc-800 text-uecg-dark dark:text-zinc-200 border-gray-200 dark:border-zinc-700";
  if (type === "TRASPASO") return "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/40";
  return "bg-blue-50 dark:bg-blue-950/20 text-uecg-blue dark:text-blue-400 border-blue-100 dark:border-blue-900/40";
};

export default function EnrollmentsGrid({
  enrollments,
  isPending,
  isFetching,
  generatingPdfId,
  onPrint,
  onApprove,
  onReject,
  canManage,
}: EnrollmentsGridProps) {
  return (
    <div
      className={`transition-opacity duration-200 pb-16 ${
        isFetching && !isPending ? "opacity-50 pointer-events-none" : "opacity-100"
      }`}
    >
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-enrollment-${i}`}
              className="border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] h-[200px] animate-pulse shadow-sm"
            />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm">
          <SwissEmptyState
            title="Bandeja Vacía"
            description="No hay solicitudes pendientes de revisión."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {enrollments.map((req: any, index: number) => {
            const initial = req.studentName.charAt(0).toUpperCase();

            return (
              <div
                key={req.id}
                className="border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm flex flex-col justify-between hover:border-uecg-blue dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 animate-in fade-in zoom-in-95 group fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Cabecera del Card */}
                <div className="p-5 flex items-start gap-4">
                  <div
                    className={`w-12 h-12 flex items-center justify-center font-black text-xl shadow-inner shrink-0 ${getBadgeStyles(
                      req.type
                    )}`}
                  >
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black uppercase tracking-tight text-xs text-uecg-dark dark:text-zinc-100 truncate group-hover:text-uecg-blue dark:group-hover:text-blue-400 transition-colors">
                      {req.studentName}
                    </p>
                    <p className="text-[9px] font-bold text-uecg-gray dark:text-zinc-400 uppercase tracking-widest mt-0.5 truncate">
                      CI: {req.ci}
                    </p>
                    <p className="text-[10px] font-black text-uecg-text dark:text-zinc-300 uppercase tracking-widest mt-1.5 truncate">
                      {req.grade}
                    </p>
                  </div>
                </div>

                {/* Subheader / Metadata */}
                <div className="px-5 py-3 bg-gray-50/50 dark:bg-zinc-900/50 border-t border-b border-uecg-line dark:border-zinc-800 flex items-center justify-between">
                  <span
                    className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${getLabelStyles(
                      req.type
                    )}`}
                  >
                    {req.type}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-uecg-gray dark:text-zinc-400">
                    {req.date}
                  </span>
                </div>

                {/* Botones de acción */}
                <div className="p-3 bg-white dark:bg-[#121214] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onPrint(req.id)}
                    disabled={generatingPdfId === req.id}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-uecg-gray dark:text-zinc-400 hover:text-uecg-dark dark:hover:text-white transition-colors cursor-pointer border border-transparent hover:border-uecg-line dark:hover:border-zinc-700 disabled:opacity-50"
                    title="Imprimir RUDE"
                  >
                    {generatingPdfId === req.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-uecg-blue" />
                    ) : (
                      <Printer className="w-4 h-4" />
                    )}
                  </button>

                  {canManage && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onReject(req.id)}
                        className="px-3 py-1.5 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1"
                        title="Rechazar Inscripción"
                      >
                        <X className="w-3.5 h-3.5" /> Rechazar
                      </button>
                      <button
                        onClick={() => onApprove(req)}
                        className="px-3 py-1.5 bg-uecg-dark dark:bg-zinc-800 hover:bg-uecg-blue dark:hover:bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1"
                        title="Aprobar Inscripción"
                      >
                        <Check className="w-3.5 h-3.5" /> Aprobar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
