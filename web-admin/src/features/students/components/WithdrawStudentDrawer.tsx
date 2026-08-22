import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, AlertTriangle, AlertOctagon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EnrollmentsService } from "@/features/enrollments/api/enrollments.service";

interface WithdrawStudentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: any | null;
}

export default function WithdrawStudentDrawer({ isOpen, onClose, enrollment }: WithdrawStudentDrawerProps) {
  const [isClient, setIsClient] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset del formulario cuando cambia el estudiante o se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setConfirmName("");
    }
  }, [isOpen, enrollment]);

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

  // Mutación para dar de baja
  const mutation = useMutation({
    mutationFn: () => {
      if (!enrollment?.id) throw new Error("ID de inscripción no disponible.");
      return EnrollmentsService.updateStatus(enrollment.id, "RETIRADO");
    },
    onSuccess: () => {
      toast.success("Estudiante dado de BAJA del establecimiento.");
      queryClient.invalidateQueries({ queryKey: ["students_population"] });
      onClose();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Error al retirar al estudiante";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    },
  });

  if (!isOpen || !enrollment) return null;

  const isConfirmed = confirmName.trim().toUpperCase() === enrollment.studentName?.toUpperCase();

  const reasons = [
    "TRASPASO A OTRO ESTABLECIMIENTO",
    "CAMBIO DE DOMICILIO DE LA FAMILIA",
    "PROBLEMAS DE SALUD",
    "ABANDONO O DESERCIÓN ESCOLAR",
    "DECISIÓN VOLUNTARIA DEL APODERADO",
    "SITUACIÓN DE FUERZA MAYOR",
  ];

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-title"
    >
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-uecg-dark/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="relative h-full w-full max-w-md border-l border-uecg-line bg-white shadow-2xl transition-transform duration-300 flex flex-col z-10 animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-red-500 bg-uecg-dark p-6 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-red-300">Zona de Alta Seguridad</span>
              <h2 id="withdraw-title" className="text-lg font-black uppercase tracking-tighter mt-0.5">
                Dar de Baja Alumno
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

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-6 custom-scrollbar">
          {/* Advertencia Crítica */}
          <div className="border border-red-200 bg-red-50 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-xs font-black uppercase tracking-tight">ADVERTENCIA DE SEGURIDAD</span>
            </div>
            <p className="text-[10px] font-bold text-uecg-dark uppercase tracking-widest leading-relaxed">
              Está a punto de retirar de forma oficial y permanente al estudiante:
            </p>
            <p className="text-xs font-black text-red-700 uppercase tracking-tight mt-1">
              {enrollment.studentName}
            </p>
            <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed">
              Esta acción inhabilitará su carnet QR de ingreso, detendrá su registro de asistencia y lo
              excluirá de las libretas de calificaciones de la presente gestión escolar.
            </p>
          </div>

          {/* Formulario */}
          <div className="flex flex-col gap-4 bg-white p-5 border border-uecg-line shadow-sm">
            {/* Razón de la baja */}
            <div className="flex flex-col gap-1.5">
              <label className="label-swiss !mb-0 !text-[10px]">
                Seleccione la Razón de la Baja <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold focus:border-red-500 cursor-pointer transition-colors"
              >
                <option value="">-- SELECCIONE UN MOTIVO --</option>
                {reasons.map((r, i) => (
                  <option key={`reason-${i}`} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Chivato de Confirmación de Nombre */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="label-swiss !mb-0 !text-[10px] text-red-600">
                Para confirmar, escriba el nombre completo del alumno:
              </label>
              <input
                type="text"
                placeholder="ESCRIBA EL NOMBRE COMPLETO..."
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold focus:border-red-500 transition-colors"
              />
              <p className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest mt-1">
                Debe coincidir exactamente con el nombre de arriba (fijarse en mayúsculas/acentos).
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
            onClick={() => mutation.mutate()}
            disabled={!reason || !isConfirmed || mutation.isPending}
            className="flex-[2] py-3 text-[10px] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-sm outline-none cursor-pointer border border-transparent"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Confirmar Retiro"
            )}
          </button>
        </footer>
      </div>
    </div>
  );

  return isClient ? createPortal(content, document.body) : null;
}
