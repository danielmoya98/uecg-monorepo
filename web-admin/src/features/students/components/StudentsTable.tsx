import { useState, useRef, useEffect } from "react";
import { Loader2, MoreVertical, Eye, Trash2, Printer, QrCode, Bell, FolderCheck, CheckSquare, Square } from "lucide-react";
import { SwissTableContainer, SwissEmptyState, SwissBatchActionBar, SwissCopyButton } from "@/shared/ui";
import { useBatchSelection } from "@/shared/hooks";

interface StudentBadgeProps {
  name: string;
  gender: string;
}

const StudentBadge = ({ name, gender }: StudentBadgeProps) => {
  const initial = name.charAt(0).toUpperCase();
  const bgColor = gender === "FEMENINO" ? "bg-pink-600" : "bg-uecg-blue";

  return (
    <div className={`w-9 h-9 flex items-center justify-center ${bgColor} text-white font-black text-sm shadow-sm shrink-0 select-none`}>
      {initial}
    </div>
  );
};

interface StudentsTableRowProps {
  student: any;
  index: number;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onOpenKardex: (id: string) => void;
  onOpenWithdraw: (student: any) => void;
  onActionRequest: (id: string, name: string, type: "MARK_PHYSICAL" | "NOTIFY") => void;
  onOpenCarnet: (student: any) => void;
  onDownloadBulletin: (id: string, name: string) => void;
}

const StudentsTableRow = ({
  student,
  index,
  isSelected = false,
  onToggleSelect,
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
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800";
      case "RETIRADO":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800";
      case "REVISION_SIE":
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800";
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
      className={`border-b border-uecg-line dark:border-zinc-800 hover:bg-blue-50/20 dark:hover:bg-zinc-800/40 transition-colors group animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
        isSelected ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
      }`}
      style={{ animationDelay: `${index * 25}ms` }}
    >
      {/* Checkbox de Selección */}
      <td className="px-3 py-3 border-r border-uecg-line dark:border-zinc-800 text-center w-10">
        <button
          type="button"
          onClick={() => onToggleSelect?.(student.id)}
          className="cursor-pointer text-uecg-gray hover:text-uecg-blue dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors flex items-center justify-center mx-auto"
          aria-label={`Seleccionar ${student.studentName}`}
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-uecg-blue dark:text-blue-400" />
          ) : (
            <Square className="w-4 h-4 opacity-40 hover:opacity-100" />
          )}
        </button>
      </td>

      {/* Identidad del Estudiante */}
      <td className="px-4 py-3 border-r border-uecg-line dark:border-zinc-800">
        <div className="flex items-center gap-3.5">
          <StudentBadge name={student.studentName} gender={student.gender} />
          <div className="flex flex-col">
            <p className="font-black uppercase tracking-tight text-xs text-uecg-text dark:text-zinc-100">
              {student.studentName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-bold text-uecg-gray dark:text-zinc-400 uppercase tracking-widest">
                CI: {student.ci || "S/CI"} • RUDE: {student.rudeCode || "S/R"}
              </span>
              {student.ci && (
                <SwissCopyButton text={student.ci} size={10} className="py-0 px-1 text-[8px]" />
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Curso */}
      <td className="px-4 py-3 border-r border-uecg-line dark:border-zinc-800 text-xs font-bold text-uecg-text dark:text-zinc-200">
        {student.classroom}
      </td>

      {/* Estado Académico */}
      <td className="px-4 py-3 border-r border-uecg-line dark:border-zinc-800 text-center">
        <span
          className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 shadow-sm border ${getStatusStyles(student.status)}`}
        >
          {student.status.replace("_", " ")}
        </span>
      </td>

      {/* Folder Físico */}
      <td className="px-4 py-3 border-r border-uecg-line dark:border-zinc-800 text-center">
        {student.hasPhysicalFolder ? (
          <div className="flex items-center justify-center text-green-600 dark:text-green-400" title="Fólder físico entregado">
            <FolderCheck className="w-5 h-5" />
          </div>
        ) : (
          <div className="flex items-center justify-center text-gray-300 dark:text-zinc-600" title="Pendiente de entrega">
            <FolderCheck className="w-5 h-5 opacity-40 border-dashed" />
          </div>
        )}
      </td>

      {/* Acciones */}
      <td className="px-4 py-3 text-center">
        <div ref={menuRef} className="relative inline-block">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-uecg-gray dark:text-zinc-400 hover:text-uecg-blue dark:hover:text-white transition-colors focus:outline-none p-1.5 bg-transparent hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-uecg-line dark:hover:border-zinc-700 cursor-pointer"
            aria-label={`Acciones para ${student.studentName}`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-zinc-900 border border-uecg-line dark:border-zinc-700 shadow-xl z-50 flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => handleAction(onOpenKardex, student.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-uecg-text dark:text-zinc-200 hover:bg-blue-50/50 dark:hover:bg-zinc-800 hover:text-uecg-blue transition-colors text-left cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-uecg-blue" /> Ver Expediente RUDE
              </button>

              <button
                type="button"
                onClick={() => handleAction(onOpenCarnet, student)}
                className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-uecg-text dark:text-zinc-200 hover:bg-blue-50/50 dark:hover:bg-zinc-800 hover:text-uecg-blue transition-colors text-left cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-purple-600" /> Generar Credencial
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isGeneratingBulletin}
                className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-uecg-text dark:text-zinc-200 hover:bg-blue-50/50 dark:hover:bg-zinc-800 hover:text-uecg-blue transition-colors text-left cursor-pointer disabled:opacity-50"
              >
                {isGeneratingBulletin ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-uecg-blue" />
                ) : (
                  <Printer className="w-3.5 h-3.5 text-uecg-blue" />
                )}
                {isGeneratingBulletin ? "Generando..." : "Descargar Boletín"}
              </button>

              <div className="border-t border-uecg-line dark:border-zinc-800 my-1" />

              <button
                type="button"
                onClick={() => handleAction(onActionRequest, student.id, student.studentName, "MARK_PHYSICAL")}
                className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-uecg-text dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
              >
                <FolderCheck className="w-3.5 h-3.5 text-green-600" />
                {student.hasPhysicalFolder ? "Desmarcar Fólder" : "Marcar Fólder Físico"}
              </button>

              <button
                type="button"
                onClick={() => handleAction(onActionRequest, student.id, student.studentName, "NOTIFY")}
                className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-uecg-text dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-500" /> Notificar a Padres
              </button>

              {student.status !== "RETIRADO" && (
                <button
                  type="button"
                  onClick={() => handleAction(onOpenWithdraw, student)}
                  className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left border-t border-uecg-line dark:border-zinc-800 cursor-pointer"
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
  const batchSelection = useBatchSelection(enrollments);

  return (
    <>
      <SwissTableContainer isFetching={isFetching} isPending={isPending}>
        <table className="w-full text-left border-collapse">
          {/* Cabecera Fija Sticky */}
          <thead className="sticky top-0 z-20 bg-gray-50 dark:bg-zinc-900 border-b border-uecg-line dark:border-zinc-800 shadow-sm">
            <tr>
              <th className="px-3 py-3.5 border-r border-uecg-line dark:border-zinc-800 text-center w-10 bg-gray-50 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={batchSelection.toggleSelectAll}
                  className="cursor-pointer text-uecg-gray hover:text-uecg-blue dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center justify-center mx-auto"
                  aria-label="Seleccionar todos los estudiantes"
                >
                  {batchSelection.isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-uecg-blue dark:text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4 opacity-40 hover:opacity-100" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                Estudiante Registrado
              </th>
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                Curso Actual
              </th>
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 text-center w-36 bg-gray-50 dark:bg-zinc-900">
                Estado Académico
              </th>
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 text-center w-28 bg-gray-50 dark:bg-zinc-900">
                Folder Físico
              </th>
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 text-center w-20 bg-gray-50 dark:bg-zinc-900">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-uecg-line dark:border-zinc-800 animate-pulse">
                  <td className="px-3 py-4 border-r border-uecg-line dark:border-zinc-800 text-center">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                  </td>
                  <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800 flex items-center gap-4">
                    <div className="w-9 h-9 bg-gray-200 dark:bg-zinc-800 shrink-0" />
                    <div className="flex flex-col gap-2">
                      <div className="h-3 w-44 bg-gray-200 dark:bg-zinc-800" />
                      <div className="h-2 w-28 bg-gray-100 dark:bg-zinc-800/60" />
                    </div>
                  </td>
                  <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-800" />
                  </td>
                  <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800">
                    <div className="h-5 w-20 bg-gray-200 dark:bg-zinc-800 mx-auto" />
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
                <td colSpan={6} className="p-0">
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
                  isSelected={batchSelection.isSelected(student.id)}
                  onToggleSelect={batchSelection.toggleSelect}
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

      {/* Barra Flotante de Acciones en Lote */}
      <SwissBatchActionBar
        selectedCount={batchSelection.selectedCount}
        itemLabel="estudiantes"
        onClear={batchSelection.clearSelection}
        actions={[
          {
            label: "Exportar RUDE",
            variant: "primary",
            onClick: () => {
              // Acción masiva de exportación
            },
          },
        ]}
      />
    </>
  );
}
