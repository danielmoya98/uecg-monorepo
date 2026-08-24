import { Megaphone, AlertTriangle } from "lucide-react";
import { DrawerShell } from "@/shared/ui/drawer-shell";

interface BroadcastHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastHelpDrawer = ({ isOpen, onClose }: BroadcastHelpDrawerProps) => {
  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title="Guía del Motor"
      kicker="Manual del Sistema"
      icon="?"
      headerVariant="blue"
      maxWidth="max-w-[450px]"
    >
      <div className="flex flex-col h-full">
        {/* CUERPO DEL DRAWER */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-zinc-900/50 flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-uecg-line p-5 shadow-sm hover:border-uecg-blue transition-colors duration-200">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-uecg-dark dark:text-zinc-100 mb-3 flex items-center gap-2 border-b border-uecg-line pb-3">
              <Megaphone className="w-4 h-4 text-uecg-blue" /> Aviso por Curso
            </h3>
            <p className="text-xs text-uecg-text dark:text-zinc-300 font-medium leading-relaxed uppercase tracking-wider">
              Utiliza la <strong className="text-uecg-blue dark:text-blue-400 font-black">Cascada Inteligente</strong>.
              Primero intentará enviar una notificación silenciosa a la App del padre. Si falla, buscará
              su Email. Si no tiene correo, preparará un chat de WhatsApp para que la secretaria lo envíe
              de forma manual al final del proceso.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-5 shadow-sm hover:border-red-300 transition-colors duration-200">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-red-700 dark:text-red-400 mb-3 flex items-center gap-2 border-b border-red-200 dark:border-red-900/40 pb-3">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" /> Alerta Institucional
            </h3>
            <p className="text-xs text-red-900/80 dark:text-red-300 font-medium leading-relaxed uppercase tracking-wider">
              Envía un mensaje masivo a todos los dispositivos móviles registrados en la base de datos del
              colegio. <strong className="text-red-600 dark:text-red-400 font-black">Omite WhatsApp y Correo</strong> para
              evitar baneos por SPAM. Diseñado para usarse solo al inicio de la gestión o en emergencias.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-uecg-line bg-white dark:bg-zinc-900 flex justify-end shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 bg-uecg-dark text-white font-black text-[11px] uppercase tracking-widest hover:bg-black transition-colors outline-none shadow-sm cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </DrawerShell>
  );
};
export default BroadcastHelpDrawer;
