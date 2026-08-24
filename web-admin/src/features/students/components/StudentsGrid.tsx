import { useState } from "react";
import { Loader2, Eye, Printer, QrCode, Bell, FolderCheck, Trash2 } from "lucide-react";
import { SwissEmptyState } from "@/shared/ui";


interface StudentCardProps {
  student: any;
  index: number;
  onOpenKardex: (id: string) => void;
  onOpenWithdraw: (student: any) => void;
  onActionRequest: (id: string, name: string, type: "MARK_PHYSICAL" | "NOTIFY") => void;
  onOpenCarnet: (student: any) => void;
  onDownloadBulletin: (id: string, name: string) => void;
}

const StudentCard = ({
  student,
  index,
  onOpenKardex,
  onOpenWithdraw,
  onActionRequest,
  onOpenCarnet,
  onDownloadBulletin,
}: StudentCardProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const initials = student.studentName.substring(0, 2).toUpperCase();
  const avatarBg = student.gender === "FEMENINO" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-uecg-blue";

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "INSCRITO":
        return "bg-green-50 text-green-700 border-green-200";
      case "RETIRADO":
        return "bg-red-50 text-red-700 border-red-200";
      case "REVISION_SIE":
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await onDownloadBulletin(student.id, student.studentName);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="border border-uecg-line bg-white shadow-sm flex flex-col justify-between hover:border-uecg-blue hover:shadow-md transition-all duration-300 animate-in fade-in zoom-in-95 group fill-mode-both"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Header del Card */}
      <div className="p-5 flex items-start gap-4">
        <div className={`w-12 h-12 flex items-center justify-center font-black text-lg shadow-inner shrink-0 ${avatarBg}`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black uppercase tracking-tight text-xs text-uecg-dark truncate group-hover:text-uecg-blue transition-colors">
            {student.studentName}
          </p>
          <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest mt-0.5 truncate">
            CI: {student.ci}
          </p>
          <p className="text-[10px] font-black text-uecg-text uppercase tracking-widest mt-1.5">
            {student.classroom}
          </p>
        </div>
      </div>

      {/* Stats y folder físico */}
      <div className="px-5 py-3 bg-gray-50/50 border-t border-b border-uecg-line flex items-center justify-between">
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${getStatusStyles(student.status)}`}>
          {student.status.replace("_", " ")}
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-uecg-gray">Folder:</span>
          {student.hasPhysicalFolder ? (
            <span className="text-[9px] font-black text-green-700 uppercase tracking-widest flex items-center gap-1">
              <FolderCheck className="w-3.5 h-3.5" /> Entregado
            </span>
          ) : (
            <button
              onClick={() => onActionRequest(student.id, student.studentName, "MARK_PHYSICAL")}
              className="text-[9px] font-black text-yellow-600 hover:text-green-700 uppercase tracking-widest cursor-pointer underline flex items-center gap-0.5"
            >
              Pendiente
            </button>
          )}
        </div>
      </div>

      {/* Botones de acción rápida */}
      <div className="p-3 bg-white flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenKardex(student.id)}
            className="p-2 hover:bg-gray-100 text-uecg-blue transition-colors cursor-pointer border border-transparent hover:border-uecg-line"
            title="Ver Historial / RUDE"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="p-2 hover:bg-gray-100 text-uecg-gray transition-colors cursor-pointer border border-transparent hover:border-uecg-line disabled:opacity-50"
            title="Imprimir Libreta"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onOpenCarnet(student)}
            className="p-2 hover:bg-gray-100 text-purple-600 transition-colors cursor-pointer border border-transparent hover:border-uecg-line"
            title="Identidad Digital"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={() => onActionRequest(student.id, student.studentName, "NOTIFY")}
            className="p-2 hover:bg-gray-100 text-yellow-600 transition-colors cursor-pointer border border-transparent hover:border-uecg-line"
            title="Notificar Apoderado"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>

        {student.status !== "RETIRADO" && (
          <button
            onClick={() => onOpenWithdraw(student)}
            className="p-2 hover:bg-red-50 text-uecg-dark hover:text-red-600 transition-colors cursor-pointer border border-transparent"
            title="Dar de Baja"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

interface StudentsGridProps {
  enrollments: any[];
  isPending: boolean;
  isFetching: boolean;
  onOpenKardex: (id: string) => void;
  onOpenWithdraw: (student: any) => void;
  onActionRequest: (id: string, name: string, type: "MARK_PHYSICAL" | "NOTIFY") => void;
  onOpenCarnet: (student: any) => void;
  onDownloadBulletin: (id: string, name: string) => void;
}

export default function StudentsGrid({
  enrollments,
  isPending,
  isFetching,
  onOpenKardex,
  onOpenWithdraw,
  onActionRequest,
  onOpenCarnet,
  onDownloadBulletin,
}: StudentsGridProps) {
  return (
    <div className={`transition-opacity duration-200 pb-16 ${isFetching && !isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-grid-${i}`}
              className="border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] h-[180px] animate-pulse shadow-sm"
            />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm">
          <SwissEmptyState
            title="Búsqueda sin resultados"
            description="No se encontraron estudiantes para los filtros actuales."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {enrollments.map((student: any, index: number) => (
            <StudentCard
              key={student.id}
              student={student}
              index={index}
              onOpenKardex={onOpenKardex}
              onOpenWithdraw={onOpenWithdraw}
              onActionRequest={onActionRequest}
              onOpenCarnet={onOpenCarnet}
              onDownloadBulletin={onDownloadBulletin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
