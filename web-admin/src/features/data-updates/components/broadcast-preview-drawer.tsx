import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, Smartphone, Mail, MessageCircle, AlertCircle, X, Loader2, Play } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { BroadcastPreviewData } from "../types/data-updates.types";

interface BroadcastPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: BroadcastPreviewData | null;
  onExecute: () => void;
  isExecuting: boolean;
}

export const BroadcastPreviewDrawer = ({
  isOpen,
  onClose,
  previewData,
  onExecute,
  isExecuting,
}: BroadcastPreviewDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // ACCESIBILIDAD: Focus Trapping y Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isExecuting) {
        onClose();
      }
      if (e.key === "Tab") {
        if (!drawerRef.current) return;
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousFocus = document.activeElement as HTMLElement;

    // Enfocar primer botón no deshabilitado
    setTimeout(() => {
      const firstBtn = drawerRef.current?.querySelector("button:not([disabled])") as HTMLElement;
      firstBtn?.focus();
    }, 100);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose, isExecuting]);

  if (!previewData) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="preview-drawer-title">
          {/* Overlay difuminado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isExecuting ? onClose : undefined}
            className="absolute inset-0 bg-uecg-dark/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Panel Lateral Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative h-full w-full max-w-[450px] border-l border-uecg-line bg-white shadow-2xl transition-transform duration-300 flex flex-col z-10"
          >
            {/* HEADER GEOMÉTRICO OSCURO */}
            <div className="flex items-center justify-between border-b p-6 md:p-8 relative overflow-hidden bg-uecg-dark border-uecg-line text-white shrink-0">
              <div className="absolute -left-8 -bottom-8 w-24 h-24 border-[4px] border-white opacity-10 rounded-none rotate-45 pointer-events-none"></div>
              <div className="absolute right-12 -top-4 w-12 h-12 bg-white opacity-5 -rotate-12 pointer-events-none"></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-uecg-blue text-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="label-swiss !mb-0 !text-[9px] text-blue-200 font-bold tracking-widest uppercase">MOTOR OMNICANAL</span>
                  <h2 id="preview-drawer-title" className="text-xl font-black uppercase tracking-tighter mt-0.5 text-white">
                    Reporte de Análisis
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isExecuting}
                aria-label="Cerrar reporte"
                className="p-2 relative z-10 text-white/50 hover:text-white transition-colors focus:outline-none bg-white/10 hover:bg-white/20 rounded-none cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CONTENIDO */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-gray-50 flex flex-col gap-6">
              <div className="border border-uecg-line p-6 bg-white shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 w-2 bg-uecg-blue"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray mb-1">
                  Población Analizada
                </span>
                <span className="text-6xl font-black tracking-tighter text-uecg-dark leading-none">
                  {previewData.total}
                </span>
              </div>

              <h3 className="text-[10px] font-black uppercase tracking-widest text-uecg-dark border-b border-uecg-line pb-2">
                Distribución de Canales
              </h3>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between border border-blue-200 bg-blue-50/50 p-4 hover:border-uecg-blue transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-uecg-blue" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-uecg-dark">
                      App Móvil (Push)
                    </span>
                  </div>
                  <span className="text-xl font-black text-uecg-blue">
                    {previewData.projection?.push ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between border border-orange-200 bg-orange-50/50 p-4 hover:border-orange-400 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-orange-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-uecg-dark">
                      Correos (Email)
                    </span>
                  </div>
                  <span className="text-xl font-black text-orange-600">
                    {previewData.projection?.email ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between border border-green-200 bg-green-50/50 p-4 hover:border-green-500 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-uecg-dark">
                      WhatsApp (Manual)
                    </span>
                  </div>
                  <span className="text-xl font-black text-green-600">
                    {previewData.projection?.whatsapp ?? 0}
                  </span>
                </div>

                {(previewData.projection?.unreachable ?? 0) > 0 && (
                  <div className="flex items-center justify-between border border-red-200 bg-red-50 p-4 mt-2">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-700">
                        Sin Contacto
                      </span>
                    </div>
                    <span className="text-xl font-black text-red-600">
                      {previewData.projection?.unreachable ?? 0}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="p-6 border-t border-uecg-line bg-white flex gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button
                type="button"
                onClick={onClose}
                disabled={isExecuting}
                className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest border border-uecg-line bg-white hover:bg-gray-50 text-uecg-gray transition-colors shadow-sm disabled:opacity-50 outline-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onExecute}
                disabled={isExecuting || previewData.total === 0}
                className="flex-[2] py-4 text-[11px] font-black uppercase tracking-widest bg-uecg-dark text-white hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 outline-none cursor-pointer"
              >
                {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isExecuting ? "Desplegando..." : "Confirmar Disparo"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
export default BroadcastPreviewDrawer;
