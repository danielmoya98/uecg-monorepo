import { Loader2, FolderCheck, Bell, AlertCircle } from "lucide-react";
import { DrawerShell } from "@/shared/ui/drawer-shell";

interface StudentActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  actionType: "MARK_PHYSICAL" | "NOTIFY" | null;
  isPending: boolean;
  onConfirm: () => void;
}

export default function StudentActionDrawer({
  isOpen,
  onClose,
  studentName,
  actionType,
  isPending,
  onConfirm,
}: StudentActionDrawerProps) {
  if (!actionType) return null;

  const getActionDetails = () => {
    if (actionType === "MARK_PHYSICAL") {
      return {
        title: "Entregar Expediente Físico",
        icon: <FolderCheck className="w-5 h-5 text-white" />,
        headerVariant: "success" as const,
        message: `Confirmar entrega del folder con toda la documentación oficial (Certificado de Nacimiento, CI, vacunas) de:`,
        warning: "Esta acción marcará al estudiante con 'Expediente Físico Completo' en el sistema, habilitando trámites del SIE.",
        confirmBtn: "Registrar Entrega",
      };
    } else {
      return {
        title: "Enviar Notificación",
        icon: <Bell className="w-5 h-5 text-white" />,
        headerVariant: "blue" as const,
        message: `Está a punto de enviar una notificación de alerta RUDE al apoderado registrado de:`,
        warning: "Se enviará una alerta automática (SMS / Correo / WhatsApp) solicitando la actualización urgente de datos socioeconómicos.",
        confirmBtn: "Enviar Notificación",
      };
    }
  };

  const details = getActionDetails();

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title={details.title}
      kicker="Secretaría Académica"
      icon={details.icon}
      headerVariant={details.headerVariant}
      isSubmitting={isPending}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col h-full">
        {/* Cuerpo */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-zinc-900/50 flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 p-5 border border-uecg-line shadow-sm flex flex-col gap-4">
            <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed">
              {details.message}
            </p>
            <p className="text-xs font-black text-uecg-dark dark:text-zinc-100 uppercase tracking-tight">
              {studentName}
            </p>
          </div>

          <div className="border border-yellow-200 dark:border-yellow-900/40 bg-yellow-50 dark:bg-yellow-950/20 p-4 flex gap-2.5">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] font-black uppercase tracking-tight text-yellow-700 dark:text-yellow-400 block mb-0.5">Nota Importante</span>
              <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed">
                {details.warning}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-5 border-t border-uecg-line bg-gray-50 dark:bg-zinc-900 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-uecg-line bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-uecg-gray dark:text-zinc-200 transition-colors shadow-sm outline-none cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-[2] py-3 text-[10px] font-black uppercase tracking-widest text-white bg-uecg-dark hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-sm outline-none cursor-pointer border border-transparent`}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              details.confirmBtn
            )}
          </button>
        </footer>
      </div>
    </DrawerShell>
  );
}
