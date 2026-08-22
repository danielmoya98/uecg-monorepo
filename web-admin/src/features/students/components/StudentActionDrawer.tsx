import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, FolderCheck, Bell, AlertCircle } from "lucide-react";

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Escape key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !actionType) return null;

  const getActionDetails = () => {
    if (actionType === "MARK_PHYSICAL") {
      return {
        title: "Entregar Expediente Físico",
        icon: <FolderCheck className="w-5 h-5 text-white" />,
        headerBg: "bg-green-600 border-green-500",
        message: `Confirmar entrega del folder con toda la documentación oficial (Certificado de Nacimiento, CI, vacunas) de:`,
        warning: "Esta acción marcará al estudiante con 'Expediente Físico Completo' en el sistema, habilitando trámites del SIE.",
        confirmBtn: "Registrar Entrega",
      };
    } else {
      return {
        title: "Enviar Notificación",
        icon: <Bell className="w-5 h-5 text-white" />,
        headerBg: "bg-uecg-blue border-blue-500",
        message: `Está a punto de enviar una notificación de alerta RUDE al apoderado registrado de:`,
        warning: "Se enviará una alerta automática (SMS / Correo / WhatsApp) solicitando la actualización urgente de datos socioeconómicos.",
        confirmBtn: "Enviar Notificación",
      };
    }
  };

  const details = getActionDetails();

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-uecg-dark/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative h-full w-full max-w-sm border-l border-uecg-line bg-white shadow-2xl transition-transform duration-300 flex flex-col z-10 animate-in slide-in-from-right duration-300"
      >
        {/* Cabecera */}
        <div className={`flex items-center justify-between border-b-4 ${details.headerBg} bg-uecg-dark p-6 text-white shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black/25 flex items-center justify-center">
              {details.icon}
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Secretaría Académica</span>
              <h2 id="action-title" className="text-lg font-black uppercase tracking-tighter mt-0.5">
                {details.title}
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
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-6">
          <div className="bg-white p-5 border border-uecg-line shadow-sm flex flex-col gap-4">
            <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed">
              {details.message}
            </p>
            <p className="text-xs font-black text-uecg-dark uppercase tracking-tight">
              {studentName}
            </p>
          </div>

          <div className="border border-yellow-200 bg-yellow-50 p-4 flex gap-2.5">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] font-black uppercase tracking-tight text-yellow-700 block mb-0.5">Nota Importante</span>
              <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed">
                {details.warning}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-5 border-t border-uecg-line bg-gray-50 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-uecg-line bg-white hover:bg-gray-100 text-uecg-gray transition-colors shadow-sm outline-none cursor-pointer"
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
    </div>
  );

  return isClient ? createPortal(content, document.body) : null;
}
