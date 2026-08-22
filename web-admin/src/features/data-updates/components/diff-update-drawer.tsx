import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldAlert,
  User,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { DataUpdatesService } from "../api/data-updates.service";
import { EnrollmentsService } from "@/features/enrollments/api/enrollments.service";
import type { DataUpdateRequest } from "../types/data-updates.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  request: DataUpdateRequest | null;
  onSuccess: () => void;
  canManage: boolean; // 🔥 Propiedad ABAC inyectada
}

function DiffRow({ label, oldVal, newVal }: { label: string; oldVal: any; newVal: any }) {
  const normalize = (v: any) => {
    if (v === null || v === undefined || v === "") return "S/R";
    if (typeof v === "boolean") return v ? "SÍ" : "NO";
    if (Array.isArray(v)) return v.length > 0 ? v.join(", ") : "N/A";
    return String(v).toUpperCase();
  };

  const oldStr = normalize(oldVal);
  const newStr = normalize(newVal);
  const hasChanged = oldStr !== newStr;

  if (!hasChanged) return null;

  return (
    <div className="flex flex-col gap-2 border-b border-uecg-line/50 py-4 last:border-0 hover:bg-blue-50/20 transition-colors px-4 group">
      <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray/70">{label}</span>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-[10px] font-bold tracking-widest uppercase w-full">
        <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 truncate w-full sm:w-[45%] line-through opacity-80 select-none">
          {oldStr}
        </span>
        <ArrowRight className="w-4 h-4 text-uecg-blue shrink-0 hidden sm:block opacity-50 group-hover:opacity-100 transition-opacity" />
        <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 truncate w-full sm:w-[45%] font-black shadow-sm">
          {newStr}
        </span>
      </div>
    </div>
  );
}

export const DiffUpdateDrawer = ({ isOpen, onClose, request, onSuccess, canManage }: Props) => {
  const queryClient = useQueryClient();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data: currentDataResponse, isLoading } = useQuery({
    queryKey: ["enrollment_full", request?.enrollmentId],
    queryFn: () => EnrollmentsService.getKardex(request!.enrollmentId),
    enabled: !!request?.enrollmentId && isOpen,
  });


  const approveMutation = useMutation({
    mutationFn: () => DataUpdatesService.approve(request!.id),
    onSuccess: () => {
      toast.success("Expediente fusionado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["data_updates_pending"] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Error al aprobar"),
  });

  const rejectMutation = useMutation({
    mutationFn: () => DataUpdatesService.reject(request!.id, rejectReason),
    onSuccess: () => {
      toast.error("Solicitud archivada.");
      setIsRejecting(false);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["data_updates_pending"] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Error al archivar"),
  });

  const isSubmitting = approveMutation.isPending || rejectMutation.isPending;

  // ACCESIBILIDAD: Focus Trapping y Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
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

    // Enfocar primer elemento interactivo del panel
    setTimeout(() => {
      const firstBtn = drawerRef.current?.querySelector("button:not([disabled])") as HTMLElement;
      firstBtn?.focus();
    }, 100);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose, isSubmitting]);

  if (!request) return null;

  const currentData = currentDataResponse?.data?.data || currentDataResponse?.data || currentDataResponse;
  const proposed = request.proposedData;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="diff-drawer-title">
          {/* Overlay difuminado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting ? onClose : undefined}
            className="absolute inset-0 bg-uecg-dark/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Panel Lateral Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative h-full w-full max-w-3xl border-l border-uecg-line bg-white shadow-2xl flex flex-col z-10"
          >
            {/* Header del Cajón */}
            <div className="flex items-center justify-between border-b border-uecg-line bg-uecg-dark p-6 md:p-8 relative overflow-hidden text-white shrink-0">
              <div className="absolute -left-8 -bottom-8 w-32 h-32 border-[8px] border-white opacity-5 rounded-none rotate-45 pointer-events-none"></div>
              <div className="absolute right-16 -top-4 w-12 h-12 bg-white opacity-10 -rotate-12 pointer-events-none"></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-uecg-blue text-white flex items-center justify-center shadow-sm">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="label-swiss !mb-0 !text-[9px] text-blue-200 font-bold tracking-widest uppercase">AUDITORÍA DE EXPEDIENTE</span>
                  <h2 id="diff-drawer-title" className="text-2xl font-black uppercase tracking-tighter text-white mt-0.5">
                    Revisión de Cambios
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="p-2 relative z-10 text-white/50 hover:text-white transition-colors focus:outline-none bg-white/10 hover:bg-white/20 rounded-none cursor-pointer disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido / Cuerpo con Scroll */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar bg-gray-50">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-uecg-gray gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-uecg-blue opacity-50" />
                  <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Obteniendo expediente original...
                  </span>
                </div>
              ) : !currentData?.student ? (
                <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-4 text-center border border-red-200 bg-white p-6 shadow-sm">
                  <ShieldAlert className="w-12 h-12 text-red-600 mb-2" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-700">
                    Incompatibilidad de Datos
                  </h3>
                  <p className="text-[10px] font-bold text-red-700/80 uppercase tracking-widest leading-relaxed max-w-xs">
                    El endpoint del Kardex respondió, pero la estructura del estudiante está vacía. Es
                    posible que el estudiante haya sido eliminado.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  <div className="border border-uecg-line p-6 bg-white shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-uecg-blue"></div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-uecg-gray mb-1">
                      Titular del Expediente Modificado
                    </p>
                    <p className="text-2xl font-black uppercase tracking-tighter text-uecg-dark leading-none">
                      {currentData.student.names}{" "}
                      <span className="text-uecg-blue">{currentData.student.lastNamePaterno}</span>
                    </p>
                    <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest mt-3 border border-uecg-line bg-gray-50 px-3 py-1.5 inline-block">
                      CI: {currentData.student.ci || "S/N"}
                    </p>
                  </div>

                  <div className="bg-white border border-uecg-line shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-uecg-dark flex items-center gap-2 bg-gray-100 p-4 border-b border-uecg-line">
                      <User className="w-4 h-4 text-uecg-blue" /> Identidad y Nacimiento
                    </h3>
                    <div>
                      <DiffRow
                        label="Nombres"
                        oldVal={currentData.student.names}
                        newVal={proposed.names}
                      />
                      <DiffRow
                        label="Apellido Paterno"
                        oldVal={currentData.student.lastNamePaterno}
                        newVal={proposed.lastNamePaterno}
                      />
                      <DiffRow label="CI" oldVal={currentData.student.ci} newVal={proposed.ci} />
                      <DiffRow
                        label="F. Nacimiento"
                        oldVal={currentData.student.birthDate?.split("T")[0]}
                        newVal={proposed.birthDate}
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-uecg-line shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-uecg-dark flex items-center gap-2 bg-gray-100 p-4 border-b border-uecg-line">
                      <MapPin className="w-4 h-4 text-uecg-blue" /> Residencia y Contacto
                    </h3>
                    <div>
                      <DiffRow
                        label="Zona/Villa"
                        oldVal={currentData.rudeRecord?.zone}
                        newVal={proposed.zone}
                      />
                      <DiffRow
                        label="Avenida/Calle"
                        oldVal={currentData.rudeRecord?.street}
                        newVal={proposed.street}
                      />
                      <DiffRow
                        label="Nro Vivienda"
                        oldVal={currentData.rudeRecord?.houseNumber}
                        newVal={proposed.houseNumber}
                      />
                      <DiffRow
                        label="Celular"
                        oldVal={currentData.rudeRecord?.cellphone}
                        newVal={proposed.cellphone}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Acciones de Modales */}
            {canManage && (
              <div className="p-6 border-t border-uecg-line bg-white flex flex-col gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                {isRejecting ? (
                  <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <label htmlFor="rejectReasonInput" className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> Motivo de la Invalidez
                    </label>
                    <input
                      id="rejectReasonInput"
                      type="text"
                      autoFocus
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Especifique el error para el registro (Ej. CI Incorrecto)..."
                      className="w-full border-2 border-red-200 bg-red-50 p-4 text-[11px] font-black uppercase tracking-widest text-red-900 outline-none focus:border-red-500 shadow-inner"
                    />
                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsRejecting(false)}
                        className="flex-1 py-4 font-bold uppercase tracking-widest text-[11px] border border-uecg-line bg-white text-uecg-gray hover:bg-gray-50 shadow-sm cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectMutation.mutate()}
                        disabled={!rejectReason.trim() || rejectMutation.isPending}
                        className="flex-[2] py-4 font-black uppercase tracking-widest text-[11px] bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 shadow-sm flex justify-center items-center gap-2 cursor-pointer focus:outline-none"
                      >
                        {rejectMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}{" "}
                        Confirmar Rechazo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      className="flex-1 py-4 font-black uppercase tracking-widest text-[11px] border border-red-200 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <XCircle className="w-4 h-4" /> Archivar
                    </button>
                    <button
                      type="button"
                      onClick={() => approveMutation.mutate()}
                      disabled={approveMutation.isPending || isLoading || !currentData?.student}
                      className="flex-[2] py-4 font-black uppercase tracking-widest text-[11px] bg-uecg-dark text-white hover:bg-uecg-blue transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-uecg-blue"
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Fusionar Expediente
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
export default DiffUpdateDrawer;
