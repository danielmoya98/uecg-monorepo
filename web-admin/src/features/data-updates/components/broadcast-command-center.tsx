import { useRef, useEffect, useState } from "react";
import { Megaphone, Users, AlertTriangle, Loader2, MessageCircle, Search, Info, ChevronDown } from "lucide-react";
import { useBroadcastCenter } from "../hooks/use-broadcast-center";

import BroadcastHelpDrawer from "./broadcast-help-drawer";
import BroadcastPreviewDrawer from "./broadcast-preview-drawer";
import type { Option } from "../types/data-updates.types";

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div className="relative flex-1" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-full flex items-center justify-between px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-uecg-blue ${
          disabled
            ? "bg-gray-100 text-uecg-gray cursor-not-allowed border-transparent"
            : "bg-white border-transparent text-uecg-text hover:text-uecg-blue cursor-pointer"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-uecg-blue" : "text-uecg-gray"
          }`}
        />
      </button>
      {isOpen && !disabled && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-1 w-full bg-white border border-uecg-line shadow-2xl z-[60] max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                value === opt.value
                  ? "bg-uecg-blue text-white"
                  : "text-uecg-gray hover:bg-gray-50 hover:text-uecg-dark"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const BroadcastCommandCenter = () => {
  const {
    selectedClassroomId,
    setSelectedClassroomId,
    whatsappTasks,
    setWhatsappTasks,
    showPreviewDrawer,
    setShowPreviewDrawer,
    showHelpDrawer,
    setShowHelpDrawer,
    previewData,
    classrooms,
    isLoadingClassrooms,
    isAnalyzing,
    isExecuting,
    analyzeClassroom,
    handleExecuteConfirmed,
    handleExecuteMassive,
  } = useBroadcastCenter();

  return (
    <section className="bg-white border border-uecg-line mb-4 shadow-sm relative z-20" aria-label="Motor de difusión de actualizaciones">
      <header className="p-5 border-b border-uecg-line bg-uecg-dark flex justify-between items-center text-white">
        <h2 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-uecg-blue animate-pulse" /> Motor de Difusión Omnicanal
        </h2>
        <button
          type="button"
          onClick={() => setShowHelpDrawer(true)}
          aria-label="Ver manual del sistema de difusión"
          className="p-1.5 text-white/50 hover:text-white border border-transparent hover:border-white/30 transition-colors bg-white/10 cursor-pointer focus:outline-none"
        >
          <Info className="w-4 h-4" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* TARJETA 1: SEGMENTADA */}
        <div className="flex flex-col justify-between p-6 md:p-8 h-56 border-b md:border-b-0 md:border-r border-uecg-line hover:bg-blue-50/20 transition-colors duration-200">
          <div>
            <div className="flex items-center gap-2 text-uecg-dark mb-2">
              <Users className="w-5 h-5 text-uecg-blue" />
              <h3 className="text-xs font-black uppercase tracking-widest">Aviso Segmentado por Curso</h3>
            </div>
            <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed">
              Analiza los canales de contacto de un aula y despliega una campaña focalizada.
            </p>
          </div>

          <div className="flex bg-gray-50 border border-uecg-line mt-auto shadow-sm">
            <CustomSelect
              value={selectedClassroomId}
              onChange={setSelectedClassroomId}
              options={classrooms.map((c: any) => ({
                value: c.id,
                label: `${c.grade} "${c.section}" — ${c.level}`,
              }))}
              placeholder={isLoadingClassrooms ? "CARGANDO..." : "SELECCIONAR AULA"}
              disabled={isLoadingClassrooms || classrooms.length === 0}
            />
            <button
              type="button"
              onClick={() => selectedClassroomId && analyzeClassroom(selectedClassroomId)}
              disabled={!selectedClassroomId || isAnalyzing}
              aria-label="Analizar curso seleccionado"
              className="px-6 md:px-8 bg-uecg-dark text-white hover:bg-uecg-blue transition-colors duration-200 text-[10px] font-black uppercase flex items-center justify-center border-l border-uecg-line disabled:opacity-50 cursor-pointer focus:outline-none"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* TARJETA 2: NUCLEAR */}
        <div className="flex flex-col justify-between p-6 md:p-8 h-56 bg-red-50/50 relative overflow-hidden group hover:bg-red-50 transition-colors duration-200">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-red-600 opacity-5 rounded-tl-full pointer-events-none group-hover:scale-110 transition-transform duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-xs font-black uppercase tracking-widest">
                Alerta Institucional (Nuclear)
              </h3>
            </div>
            <p className="text-[10px] font-bold text-red-800/70 uppercase tracking-widest leading-relaxed">
              Dispara la campaña oficial a TODA la base de datos de la institución (Solo notificaciones App).
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              window.confirm("ATENCIÓN: ¿Seguro de enviar notificación global a toda la institución?") &&
              handleExecuteMassive()
            }
            disabled={isExecuting}
            className="w-full py-4 mt-auto border border-red-200 bg-white text-red-600 text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors flex justify-center items-center gap-2 shadow-sm disabled:opacity-50 relative z-10 cursor-pointer focus:outline-none"
          >
            {isExecuting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Ejecutar Difusión Masiva"
            )}
          </button>
        </div>
      </div>

      {/* TAREAS WHATSAPP */}
      {whatsappTasks.length > 0 && (
        <div className="border-t border-uecg-line bg-green-50/30 p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-green-200 pb-3 mb-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-green-800 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-600 animate-bounce" /> Tareas Manuales Requeridas
            </h3>
            <span className="text-[10px] font-black bg-green-200 text-green-800 px-2 py-1">
              {whatsappTasks.length} Restantes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto custom-scrollbar">
            {whatsappTasks.map((task, index) => (
              <div
                key={index}
                className="border border-green-200 p-3 flex justify-between items-center bg-white shadow-sm hover:border-green-400 transition-colors duration-200"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-uecg-dark truncate w-2/3">
                  {task.studentName}
                </span>
                <a
                  href={task.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setWhatsappTasks((prev) => prev.filter((_, i) => i !== index))}
                  className="px-4 py-2.5 bg-green-600 text-white border border-green-600 text-[9px] font-black uppercase tracking-widest hover:bg-green-700 transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  Enviar Chat
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DRAWERS SRP */}
      <BroadcastPreviewDrawer
        isOpen={showPreviewDrawer}
        onClose={() => setShowPreviewDrawer(false)}
        previewData={previewData}
        onExecute={handleExecuteConfirmed}
        isExecuting={isExecuting}
      />

      <BroadcastHelpDrawer isOpen={showHelpDrawer} onClose={() => setShowHelpDrawer(false)} />
    </section>
  );
};
export default BroadcastCommandCenter;
