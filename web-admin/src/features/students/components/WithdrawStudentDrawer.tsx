import { useState, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { DrawerShell } from "@/shared/ui/drawer-shell";
import { EnrollmentsService } from "@/features/enrollments/api/enrollments.service";

interface WithdrawStudentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: any | null;
}

export default function WithdrawStudentDrawer({ isOpen, onClose, enrollment }: WithdrawStudentDrawerProps) {
  const [reason, setReason] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const queryClient = useQueryClient();

  // Reset del formulario cuando cambia el estudiante o se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setConfirmName("");
    }
  }, [isOpen, enrollment]);

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

  if (!enrollment) return null;

  const isConfirmed = confirmName.trim().toUpperCase() === enrollment.studentName?.toUpperCase();

  const reasons = [
    "TRASPASO A OTRO ESTABLECIMIENTO",
    "CAMBIO DE DOMICILIO DE LA FAMILIA",
    "PROBLEMAS DE SALUD",
    "ABANDONO O DESERCIÓN ESCOLAR",
    "DECISIÓN VOLUNTARIA DEL APODERADO",
    "SITUACIÓN DE FUERZA MAYOR",
  ];

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title="Dar de Baja Alumno"
      kicker="Zona de Alta Seguridad"
      icon="!"
      headerVariant="danger"
      isSubmitting={mutation.isPending}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col h-full">
        {/* Cuerpo */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-zinc-900/50 flex flex-col gap-6 custom-scrollbar">
          <div className="border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4 flex gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-tight text-red-700 dark:text-red-400 block mb-1">
                Acción Irreversible
              </span>
              <p className="text-[10px] font-bold text-red-900/80 dark:text-red-300 uppercase tracking-widest leading-relaxed">
                Dar de baja implica revocar el estado de estudiante regular, anular accesos biométricos/QR y registrar la baja formal en los reportes ministeriales SIE.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 border border-uecg-line shadow-sm flex flex-col gap-4">
            <div>
              <span className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">Estudiante a Retirar</span>
              <p className="text-xs font-black uppercase text-uecg-dark dark:text-zinc-100 mt-0.5">
                {enrollment.studentName}
              </p>
              <p className="text-[10px] font-bold text-uecg-gray mt-1">C.I.: {enrollment.ci}</p>
            </div>

            {/* Motivo de Retiro */}
            <div className="flex flex-col gap-1.5 border-t border-uecg-line pt-3">
              <label className="label-swiss !mb-0 !text-[10px]">Motivo del Retiro / Baja</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-uecg-line bg-white dark:bg-zinc-800 p-2.5 uppercase outline-none text-xs font-bold focus:border-red-500 transition-colors"
              >
                <option value="">-- SELECCIONE UN MOTIVO --</option>
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Chivato de Confirmación de Nombre */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="label-swiss !mb-0 !text-[10px] text-red-600 dark:text-red-400">
                Para confirmar, escriba el nombre completo del alumno:
              </label>
              <input
                type="text"
                placeholder="ESCRIBA EL NOMBRE COMPLETO..."
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                className="w-full border border-uecg-line bg-white dark:bg-zinc-800 p-3 uppercase outline-none text-xs font-bold focus:border-red-500 transition-colors"
              />
              <p className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest mt-1">
                Debe coincidir exactamente con el nombre de arriba (fijarse en mayúsculas/acentos).
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-5 border-t border-uecg-line bg-gray-50 dark:bg-zinc-900 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-uecg-line bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-uecg-gray dark:text-zinc-200 transition-colors shadow-sm outline-none cursor-pointer"
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
    </DrawerShell>
  );
}
