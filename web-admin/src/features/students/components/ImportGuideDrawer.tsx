import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, HelpCircle, FileSpreadsheet, CheckCircle2, ChevronRight } from "lucide-react";

interface ImportGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportGuideDrawer({ isOpen, onClose }: ImportGuideDrawerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const steps = [
    {
      num: "1",
      title: "Descargar la Plantilla Estandarizada",
      desc: "Descargue el modelo CSV/Excel patrón desde el panel lateral izquierdo. Respetar el nombre y orden de las columnas es de carácter obligatorio.",
    },
    {
      num: "2",
      title: "Rellenar la Información del Curso",
      desc: "Llene los datos de los estudiantes. Asegúrese de que el C.I. y las fechas estén en formatos válidos, y que el género sea MASCULINO o FEMENINO.",
    },
    {
      num: "3",
      title: "Seleccionar Curso y Cargar Archivo",
      desc: "Busque el curso paralelo en el listado del panel izquierdo, asigne el estado de importación y suba el archivo procesado en el dropzone de la derecha.",
    },
    {
      num: "4",
      title: "Previsualizar y Confirmar Migración",
      desc: "Inspeccione los registros detectados en la tabla interactiva de revisión y pulse 'Ejecutar Importación' para consolidar la base de datos.",
    },
  ];

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-uecg-dark/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative h-full w-full max-w-md border-l border-uecg-line bg-white shadow-2xl transition-transform duration-300 flex flex-col z-10 animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-uecg-line bg-uecg-dark p-6 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-uecg-blue flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-200">Ayuda al Usuario</span>
              <h2 id="guide-title" className="text-lg font-black uppercase tracking-tighter mt-0.5">
                ¿Cómo funciona esto?
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full hover:bg-white/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-6 custom-scrollbar">
          <div className="border border-uecg-line bg-white p-5 shadow-sm flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-1.5 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" /> Procedimiento de Carga Masiva
            </span>
            <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed">
              La migración de estudiantes por curso le permite dar de alta a toda la lista de un aula a través de hojas de cálculo de forma automática e inmediata, reduciendo a cero el tiempo de transcripción administrativa manual.
            </p>
          </div>

          {/* Listado de Pasos */}
          <div className="flex flex-col gap-4">
            {steps.map((s, i) => (
              <div key={`step-${i}`} className="bg-white p-4 border border-uecg-line shadow-sm flex items-start gap-4 hover:border-uecg-blue transition-colors duration-200">
                <div className="w-8 h-8 bg-uecg-dark text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm border border-black">
                  {s.num}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[10px] font-black uppercase text-uecg-dark tracking-tight flex items-center justify-between">
                    {s.title}
                    <ChevronRight className="w-3.5 h-3.5 text-uecg-gray" />
                  </h4>
                  <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed mt-1">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-green-200 bg-green-50/50 p-4 flex gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] font-black uppercase tracking-tight text-green-700 block">Sincronización en Vivo</span>
              <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed mt-0.5">
                Una vez completado el procesamiento, los estudiantes aparecerán listos en el listado de población, con su credencial criptográfica de acceso e ingreso al colegio habilitada al instante.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-5 border-t border-uecg-line bg-gray-50 flex shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-uecg-dark text-white hover:bg-black transition-colors shadow-sm outline-none cursor-pointer"
          >
            Entendido, Cerrar Guía
          </button>
        </footer>
      </div>
    </div>
  );

  return isClient ? createPortal(content, document.body) : null;
}
