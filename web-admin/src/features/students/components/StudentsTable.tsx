import { useState, useRef, useEffect } from "react";
import { Loader2, MoreVertical, Eye, Trash2, Printer, QrCode, Bell, FolderCheck } from "lucide-react";
import { SwissTableContainer, SwissEmptyState } from "@/shared/ui";


interface StudentBadgeProps {
  name: string;
  gender: string;
}

const StudentBadge = ({ name, gender }: StudentBadgeProps) => {
  const initial = name.charAt(0).toUpperCase();
  const bgColor = gender === "FEMENINO" ? "bg-pink-600" : "bg-uecg-blue";

  return (
    <div className={`w-10 h-10 flex items-center justify-center ${bgColor} text-white font-black text-xl shadow-sm shrink-0`}>
      {initial}
    </div>
  );
};

interface StudentsTableRowProps {
  student: any;
  index: number;
  onOpenKardex: (id: string) => void;
  onOpenWithdraw: (student: any) => void;
  onActionRequest: (id: string, name: string, type: "MARK_PHYSICAL" | "NOTIFY") => void;
  onOpenCarnet: (student: any) => void;
  onDownloadBulletin: (id: string, name: string) => void;
}

const StudentsTableRow = ({
  student,
  index,
  onOpenKardex,
  onOpenWithdraw,
  onActionRequest,
  onOpenCarnet,
  onDownloadBulletin,
}: StudentsTableRowProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingBulletin, setIsGeneratingBulletin] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleAction = (actionFn: Function, ...args: any[]) => {
    setIsOpen(false);
    actionFn(...args);
  };

  const handleDownload = async () => {
    setIsOpen(false);
    setIsGeneratingBulletin(true);
    try {
      await onDownloadBulletin(student.id, student.studentName);
    } finally {
      setIsGeneratingBulletin(false);
    }
  };

  return (
    <tr
      className="border-b border-uecg-line hover:bg-blue-50/20 transition-colors group animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <td className="px-4 py-3 border-r border-uecg-line">
        <div className="flex items-center gap-4">
          <StudentBadge name={student.studentName} gender={student.gender} />
          <div className="flex flex-col">
            <p className="font-black uppercase tracking-tight text-xs text-uecg-text">{student.studentName}</p>
            <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest mt-0.5">
              CI: {student.ci} • RUDE: {student.rudeCode}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 border-r border-uecg-line text-xs font-bold text-uecg-text">
        {student.classroom}
      </td>
      <td className="px-4 py-3 border-r border-uecg-line text-center">
        <span
          className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 shadow-sm border ${getStatusStyles(student.status)}`}
        >
          {student.status.replace("_", " ")}
        </span>
      </td>
      <td className="px-4 py-3 border-r border-uecg-line text-center">
        {student.hasPhysicalFolder ? (
          <div className="flex items-center justify-center text-green-600" title="Fólder físico entregado">
            <FolderCheck className="w-5 h-5" />
          </div>
        ) : (
          <div className="flex items-center justify-center text-gray-300" title="Pendiente de entrega">
            <FolderCheck className="w-5 h-5 opacity-40 border-dashed" />
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <div ref={menuRef} className="relative inline-block">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-uecg-gray hover:text-uecg-blue transition-colors focus:outline-none p-1.5 border border-transparent hover:border-uecg-line hover:bg-white cursor-pointer"
          >
            {isGeneratingBulletin ? (
              <Loader2 className="w-4 h-4 mx-auto animate-spin" />
            ) : (
              <MoreVertical className="w-4 h-4 mx-auto" />
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 top-8 w-56 bg-white border border-uecg-line shadow-2xl z-20 flex flex-col text-left animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-2 border-b border-uecg-line bg-gray-50 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray">
                  Expediente Escolar
                </span>
              </div>
              <button
                onClick={() => handleAction(onOpenKardex, student.id)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors text-uecg-text w-full text-left cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-uecg-blue" /> Ver Historial / RUDE
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors text-uecg-text w-full text-left cursor-pointer border-t border-uecg-line"
              >
                <Printer className="w-3.5 h-3.5 text-uecg-gray" /> Imprimir Libreta
              </button>
              <button
                onClick={() => handleAction(onOpenCarnet, student)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors text-uecg-text w-full text-left cursor-pointer border-t border-uecg-line"
              >
                <QrCode className="w-3.5 h-3.5 text-purple-600" /> Identidad Digital
              </button>
              
              <div className="px-3 py-1.5 border-t border-b border-uecg-line bg-gray-50 flex items-center">
                <span className="text-[8px] font-black uppercase tracking-widest text-uecg-gray">
                  Acciones Administrativas
                </span>
              </div>
              
              {!student.hasPhysicalFolder && (
                <button
                  onClick={() => handleAction(onActionRequest, student.id, student.studentName, "MARK_PHYSICAL")}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors text-green-700 w-full text-left cursor-pointer"
                >
                  <FolderCheck className="w-3.5 h-3.5" /> Entregar Folder Físico
                </button>
              )}
              <button
                onClick={() => handleAction(onActionRequest, student.id, student.studentName, "NOTIFY")}
                className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors text-uecg-blue w-full text-left cursor-pointer border-t border-uecg-line"
              >
                <Bell className="w-3.5 h-3.5" /> Notificar Apoderado
              </button>
              {student.status !== "RETIRADO" && (
                <button
                  onClick={() => handleAction(onOpenWithdraw, student)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-uecg-dark hover:bg-red-600 hover:text-white transition-colors border-t border-uecg-line w-full text-left cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Dar de Baja
                </button>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

interface StudentsTableProps {
  enrollments: any[];
  isPending: boolean;
  isFetching: boolean;
  onOpenKardex: (id: string) => void;
  onOpenWithdraw: (student: any) => void;
  onActionRequest: (id: string, name: string, type: "MARK_PHYSICAL" | "NOTIFY") => void;
  onOpenCarnet: (student: any) => void;
  onDownloadBulletin: (id: string, name: string) => void;
}

export default function StudentsTable({
  enrollments,
  isPending,
  isFetching,
  onOpenKardex,
  onOpenWithdraw,
  onActionRequest,
  onOpenCarnet,
  onDownloadBulletin,
}: StudentsTableProps) {
  return (
    <SwissTableContainer isFetching={isFetching} isPending={isPending}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-uecg-line dark:border-zinc-800">
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">
              Estudiante Registrado
            </th>
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">
              Curso Actual
            </th>
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 text-center w-36">
              Estado Académico
            </th>
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 text-center w-28">
              Folder Físico
            </th>
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 text-center w-20">
              Acción
            </th>
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-uecg-line dark:border-zinc-800 animate-pulse">
                <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-zinc-800 shrink-0" />
                  <div className="flex flex-col gap-2">
                    <div className="h-3 w-44 bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-2 w-28 bg-gray-100 dark:bg-zinc-800/60" />
                  </div>
                </td>
                <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-800" />
                </td>
                <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-5 w-20 bg-gray-150 dark:bg-zinc-800 mx-auto" />
                </td>
                <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                </td>
              </tr>
            ))
          ) : enrollments.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-0">
                <SwissEmptyState
                  title="Búsqueda sin resultados"
                  description="No se encontraron estudiantes para los filtros actuales."
                />
              </td>
            </tr>
          ) : (
            enrollments.map((student: any, index: number) => (
              <StudentsTableRow
                key={student.id}
                student={student}
                index={index}
                onOpenKardex={onOpenKardex}
                onOpenWithdraw={onOpenWithdraw}
                onActionRequest={onActionRequest}
                onOpenCarnet={onOpenCarnet}
                onDownloadBulletin={onDownloadBulletin}
              />
            ))
          )}
        </tbody>
      </table>
    </SwissTableContainer>
  );
}

