import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Megaphone, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface BroadcastHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastHelpDrawer = ({ isOpen, onClose }: BroadcastHelpDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // ACCESIBILIDAD: Focus Trapping y Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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

    // Enfocar primer elemento
    setTimeout(() => {
      const closeBtn = drawerRef.current?.querySelector("button") as HTMLElement;
      closeBtn?.focus();
    }, 100);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="help-drawer-title">
          {/* Overlay interactivo optimizado para GPU */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={onClose}
            className="absolute inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu cursor-pointer"
          />

          {/* Panel Lateral Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="relative h-full w-full max-w-[450px] border-l border-uecg-line bg-white shadow-2xl flex flex-col z-10 will-change-transform transform-gpu"
          >
            {/* HEADER GEOMÉTRICO */}
            <div className="flex items-center justify-between border-b p-6 relative overflow-hidden bg-blue-50 border-blue-200 text-uecg-blue shrink-0">
              <div className="absolute -right-8 -top-8 w-24 h-24 border-[6px] border-current opacity-10 rounded-none rotate-45 pointer-events-none"></div>
              <div className="absolute left-1/2 bottom-0 w-8 h-2 bg-current opacity-10 pointer-events-none"></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center shadow-sm text-white font-black text-lg bg-uecg-blue">
                  ?
                </div>
                <div>
                  <span className="label-swiss !mb-0 !text-[9px] text-inherit font-bold tracking-widest uppercase">MANUAL DEL SISTEMA</span>
                  <h2 id="help-drawer-title" className="text-xl font-black uppercase tracking-tighter mt-0.5 text-blue-900">
                    Guía del Motor
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar manual"
                className="p-1.5 relative z-10 hover:text-blue-900 transition-colors focus:outline-none bg-white/50 rounded-full hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CUERPO DEL DRAWER */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gray-50 flex flex-col gap-6">
              <div className="bg-white border border-uecg-line p-5 shadow-sm hover:border-uecg-blue transition-colors duration-200">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-uecg-dark mb-3 flex items-center gap-2 border-b border-uecg-line pb-3">
                  <Megaphone className="w-4 h-4 text-uecg-blue" /> Aviso por Curso
                </h3>
                <p className="text-xs text-uecg-text font-medium leading-relaxed uppercase tracking-wider">
                  Utiliza la <strong className="text-uecg-blue font-black">Cascada Inteligente</strong>.
                  Primero intentará enviar una notificación silenciosa a la App del padre. Si falla, buscará
                  su Email. Si no tiene correo, preparará un chat de WhatsApp para que la secretaria lo envíe
                  de forma manual al final del proceso.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 p-5 shadow-sm hover:border-red-300 transition-colors duration-200">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-3 flex items-center gap-2 border-b border-red-200 pb-3">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Alerta Institucional
                </h3>
                <p className="text-xs text-red-900/80 font-medium leading-relaxed uppercase tracking-wider">
                  Envía un mensaje masivo a todos los dispositivos móviles registrados en la base de datos del
                  colegio. <strong className="text-red-600 font-black">Omite WhatsApp y Correo</strong> para
                  evitar baneos por SPAM. Diseñado para usarse solo al inicio de la gestión o en emergencias.
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t border-uecg-line bg-white flex justify-end shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 bg-uecg-dark text-white font-black text-[11px] uppercase tracking-widest hover:bg-black transition-colors outline-none shadow-sm cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
export default BroadcastHelpDrawer;
