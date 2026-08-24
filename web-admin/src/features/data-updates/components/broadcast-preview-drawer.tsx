import { ShieldCheck, Smartphone, Mail, MessageCircle, AlertCircle, Loader2, Play } from "lucide-react";
import { DrawerShell } from "@/shared/ui/drawer-shell";
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
  if (!previewData) return null;

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title="Proyección de Impacto"
      kicker="Motor Multicanal"
      icon={<ShieldCheck className="w-5 h-5 text-white" />}
      headerVariant="dark"
      isSubmitting={isExecuting}
      maxWidth="max-w-[450px]"
    >
      <div className="flex flex-col h-full">
        {/* CUERPO DEL DRAWER */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-zinc-900/50 flex flex-col gap-6">
          <div className="border border-uecg-line bg-white dark:bg-zinc-900 p-6 flex flex-col gap-4 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray border-b border-uecg-line pb-2">
              Destinatarios Calculados
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-uecg-dark dark:text-zinc-100 tracking-tighter">
                {previewData.total}
              </span>
              <span className="text-xs font-bold text-uecg-gray uppercase tracking-widest">
                familias en cola
              </span>
            </div>
            <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed">
              El algoritmo de despacho optimizará el canal de salida en función de la disponibilidad y estado de conexión de cada usuario.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">
              Desglose de Distribución Proyectada
            </span>

            <div className="flex items-center justify-between border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-4 hover:border-uecg-blue transition-colors duration-200">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-uecg-blue dark:text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-uecg-dark dark:text-zinc-100">
                  App Móvil (Push)
                </span>
              </div>
              <span className="text-xl font-black text-uecg-blue dark:text-blue-400">
                {previewData.projection?.push ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between border border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/20 p-4 hover:border-orange-400 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-uecg-dark dark:text-zinc-100">
                  Correos (Email)
                </span>
              </div>
              <span className="text-xl font-black text-orange-600 dark:text-orange-400">
                {previewData.projection?.email ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between border border-green-200 dark:border-green-900/40 bg-green-50/50 dark:bg-green-950/20 p-4 hover:border-green-500 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-uecg-dark dark:text-zinc-100">
                  WhatsApp (Manual)
                </span>
              </div>
              <span className="text-xl font-black text-green-600 dark:text-green-400">
                {previewData.projection?.whatsapp ?? 0}
              </span>
            </div>

            {(previewData.projection?.unreachable ?? 0) > 0 && (
              <div className="flex items-center justify-between border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4 mt-2">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-700 dark:text-red-400">
                    Sin Contacto
                  </span>
                </div>
                <span className="text-xl font-black text-red-600 dark:text-red-400">
                  {previewData.projection?.unreachable ?? 0}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="p-6 border-t border-uecg-line bg-white dark:bg-zinc-900 flex gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest border border-uecg-line bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-uecg-gray dark:text-zinc-200 transition-colors shadow-sm disabled:opacity-50 outline-none cursor-pointer"
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
      </div>
    </DrawerShell>
  );
};
export default BroadcastPreviewDrawer;
