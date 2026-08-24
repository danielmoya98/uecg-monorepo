import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, Loader2, ShieldCheck, Key, FileCheck, FileText, Users } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { EnrollmentsService } from "../api/enrollments.service";

// DICCIONARIO OFICIAL (Intacto)
const DOCUMENT_REQUIREMENTS: Record<string, { id: string; label: string; optional?: boolean }[]> = {
  NUEVO: [
    { id: "certNacimiento", label: "Certificado Nacimiento (Orig/Fotocopia)" },
    { id: "ciEstudiante", label: "C.I. Estudiante (Orig/Fotocopia)" },
    { id: "ciTutor", label: "C.I. Padre/Madre/Tutor (Fotocopia)" },
    { id: "vacunas", label: "Carnet de Vacunas (Fotocopia)" },
    { id: "certCentroInfantil", label: "Certificado de Centro Infantil", optional: true },
  ],
  TRASPASO: [
    { id: "ciEstudiante", label: "C.I. Estudiante" },
    { id: "ciTutor", label: "C.I. Padre/Madre/Tutor" },
    { id: "libretaEscolar", label: "Libreta Escolar (Gestión anterior)" },
    { id: "rudeFisico", label: "Formulario RUDE Físico" },
    { id: "noAdeudo", label: "Certificado No Adeudo (Col. Privados)", optional: true },
  ],
  EXTRANJERO: [
    { id: "docIdentidadExt", label: "C.I. Extranjero o Pasaporte" },
    { id: "certNacimientoLegalizado", label: "Cert. Nacimiento Legalizado/Apostillado" },
    { id: "docsAcademicos", label: "Documentos Académicos Legalizados" },
    { id: "examenNivelacion", label: "Examen Nivelación (Comisión)", optional: true },
  ],
  ANTIGUO: [
    { id: "rudeActualizado", label: "Formulario RUDE actualizado", optional: true },
    { id: "ciVigente", label: "C.I. Estudiante (Fotocopia simple)", optional: true },
  ],
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  enrollment: { id: string; studentName: string; ci: string; type: string; rudeCode?: string } | null;
}

export default function ApproveEnrollmentDrawer({ isOpen, onClose, enrollment }: Props) {
  const queryClient = useQueryClient();
  const [rudeCode, setRudeCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [docs, setDocs] = useState<Record<string, boolean>>({});

  const hasExistingCode = Boolean(enrollment?.rudeCode);
  const isCodeRequired = !hasExistingCode && enrollment?.type !== "ANTIGUO";
  const isButtonDisabled = isCodeRequired && rudeCode.trim().length < 5;

  const currentRequirements = useMemo(() => {
    return enrollment
      ? DOCUMENT_REQUIREMENTS[enrollment.type] || DOCUMENT_REQUIREMENTS["NUEVO"]
      : [];
  }, [enrollment]);

  // FETCH TEMPRANO (Intacto)
  const { data: fullDataResponse, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["enrollment_full", enrollment?.id],
    queryFn: () => EnrollmentsService.getDetails(enrollment!.id),
    enabled: !!enrollment?.id && isOpen,
  });

  const fullData = fullDataResponse;
  const siblings = fullData?.siblings || [];

  // Sincronización de variables
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (isOpen && enrollment) {
      setRudeCode(enrollment.rudeCode || "");
      setError(null);
      setIsGeneratingPdf(false);

      const initialDocs: Record<string, boolean> = {};
      currentRequirements.forEach((req) => {
        initialDocs[req.id] = false;
      });
      setDocs(initialDocs);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen, enrollment, currentRequirements]);

  // Cierre mediante ESC para A11y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // PDF GEN (Intacto, corregida la ruta del template)
  const generatePDF = async (filename: string, pdfData: unknown) => {
    setIsGeneratingPdf(true);
    toast("Compilando Documento Oficial...", { icon: <FileText className="w-4 h-4" /> });
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: RudePdfTemplate } = await import("./RudePdfTemplate");
      const blob = await pdf(<RudePdfTemplate data={pdfData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Proceso de inscripción cerrado y completado.");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al compilar el PDF");
      onClose();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // MUTACION (Intacto)
  const approveMutation = useMutation({
    mutationFn: () => EnrollmentsService.approve(enrollment!.id, hasExistingCode ? undefined : rudeCode, docs),
    onSuccess: async () => {
      toast.success("Estudiante inscrito oficialmente");
      queryClient.invalidateQueries({ queryKey: ["enrollments_pending"] });
      if (fullData) {
        await generatePDF(`RUDE_2026_${fullData.student?.ci || "Estudiante"}.pdf`, fullData);
      } else {
        onClose();
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const msg = err.response?.data?.message || "Error al procesar la inscripción";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    },
  });

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollment) return;
    if (isCodeRequired && !rudeCode.trim()) return setError("EL CÓDIGO RUDE ES OBLIGATORIO");
    approveMutation.mutate();
  };

  // Renderizado mediante Portal en document.body para evitar z-index solapados
  return createPortal(
    <AnimatePresence>
      {isOpen && enrollment && (
        <div
          className="fixed inset-0 z-[9999] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-approve-title"
        >
          {/* Overlay interactivo optimizado para GPU */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu cursor-pointer"
            onClick={!approveMutation.isPending && !isGeneratingPdf ? onClose : undefined}
          />

          {/* Cajón lateral suizo */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="relative h-full w-full max-w-[400px] border-l border-uecg-line bg-white shadow-2xl flex flex-col z-10 will-change-transform transform-gpu"
          >
            {/* HEADER GEOMÉTRICO (MODO ÉXITO/VERDE) */}
            <div className="flex items-center justify-between border-b p-6 relative overflow-hidden bg-green-50 border-green-200 text-green-700 shrink-0">
              <div className="absolute -right-8 -top-8 w-24 h-24 border-[6px] border-current opacity-10 rounded-none rotate-45 pointer-events-none"></div>
              <div className="absolute right-12 -bottom-4 w-12 h-12 bg-current opacity-10 -rotate-12 pointer-events-none"></div>
              <div className="absolute left-1/2 bottom-0 w-8 h-2 bg-current opacity-10 pointer-events-none"></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center shadow-sm text-white font-black text-lg bg-green-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="label-swiss !mb-0 !text-[9px] text-inherit">Consolidación SIE</span>
                  <h2
                    id="drawer-approve-title"
                    className="text-xl font-black uppercase tracking-tighter mt-0.5 text-green-800"
                  >
                    Aprobar Inscripción
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={approveMutation.isPending || isGeneratingPdf}
                className="p-1.5 relative z-10 hover:text-green-900 transition-colors focus:outline-none disabled:opacity-50 bg-white/50 rounded-full hover:bg-white cursor-pointer"
                aria-label="Cerrar panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido scrollable con trampa de foco A11y */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar" tabIndex={0}>
              {/* Tarjeta de Estudiante Geométrica */}
              <div className="border border-uecg-line p-4 bg-gray-50 mb-5 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 bg-uecg-dark text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest">
                    Estudiante ({enrollment.type})
                  </p>
                  <p className="text-sm font-black uppercase tracking-tight text-uecg-text mt-0.5 leading-none">
                    {enrollment.studentName}
                  </p>
                  <p className="text-[10px] font-bold text-uecg-gray mt-1">CI: {enrollment.ci}</p>
                </div>
              </div>

              {/* ALERTA DE HERMANOS */}
              {isLoadingDetails ? (
                <div className="mb-5 flex items-center justify-center py-4 border border-uecg-line border-dashed text-[10px] font-bold text-uecg-gray uppercase tracking-widest gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-uecg-blue" /> Consultando grupo familiar...
                </div>
              ) : siblings.length > 0 ? (
                <div className="mb-5 border border-purple-200 bg-purple-50 p-4 relative overflow-hidden shadow-sm">
                  <div className="absolute right-0 top-0 w-16 h-16 border-[4px] border-purple-200 rounded-full translate-x-4 -translate-y-4"></div>
                  <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-purple-800">
                      <Users className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Familia Detectada ({siblings.length})
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-1 border-l-2 border-purple-300 pl-3">
                      {siblings.map((sibling: { names: string; classroom: string }, idx: number) => (
                        <div key={idx} className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-purple-900 leading-tight">
                            {sibling.names}
                          </span>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-purple-600">
                            {sibling.classroom}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleApprove} className="flex flex-col gap-6">
                {/* CHECKLIST SUIZO */}
                <div className="border border-uecg-line bg-white flex flex-col transition-colors hover:border-uecg-blue shadow-sm">
                  <div className="bg-gray-50 border-b border-uecg-line p-3 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-uecg-blue" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-uecg-dark">
                      Recepción de Fólder Físico
                    </span>
                  </div>

                  <div className="flex flex-col p-4 gap-4">
                    {currentRequirements.map((req) => (
                      <label key={req.id} className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={docs[req.id] || false}
                            onChange={(e) => setDocs({ ...docs, [req.id]: e.target.checked })}
                            className="peer w-4 h-4 appearance-none border border-uecg-line bg-gray-50 checked:bg-uecg-blue checked:border-uecg-blue transition-all cursor-pointer"
                          />
                          <CheckCircle className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="flex flex-col">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest transition-colors ${docs[req.id] ? "text-uecg-blue" : "text-uecg-text group-hover:text-uecg-blue"}`}
                          >
                            {req.label}
                          </span>
                          {req.optional && (
                            <span className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest mt-0.5">
                              (Opcional)
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* RUDE Y BOTÓN FINAL */}
                <div className="flex flex-col gap-4 border-t border-uecg-line pt-5">
                  <div
                    className={`p-4 text-[9px] font-bold uppercase tracking-widest leading-relaxed border shadow-sm ${hasExistingCode ? "bg-green-50 border-green-200 text-green-700" : isCodeRequired ? "bg-red-50 border-red-200 text-red-700" : "bg-blue-50 border-blue-200 text-uecg-blue"}`}
                  >
                    {hasExistingCode
                      ? "✓ EL ESTUDIANTE YA POSEE UN CÓDIGO RUDE OFICIAL."
                      : isCodeRequired
                        ? "⚠️ DEBE INGRESAR EL CÓDIGO GENERADO POR EL SIE PARA CONTINUAR."
                        : "Si el estudiante no tiene código, ingrese el generado por el Ministerio."}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="rudeCode" className="label-swiss !mb-0 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-uecg-blue" /> Código RUDE Oficial{" "}
                      {isCodeRequired && <span className="text-red-600">*</span>}
                    </label>
                    <input
                      id="rudeCode"
                      type="text"
                      value={rudeCode}
                      onChange={(e) => {
                        setRudeCode(e.target.value.toUpperCase().trim());
                        if (error) setError(null);
                      }}
                      disabled={
                        hasExistingCode ||
                        approveMutation.isPending ||
                        isGeneratingPdf ||
                        isLoadingDetails
                      }
                      className={`w-full border p-3.5 text-uecg-text focus:outline-none uppercase text-xs font-black tracking-widest transition-colors shadow-sm ${error ? "border-red-500 bg-red-50" : hasExistingCode ? "bg-gray-100 border-uecg-line text-uecg-gray cursor-not-allowed" : "border-uecg-line bg-white focus:border-uecg-blue"}`}
                      placeholder="EJ: 8073014520261234"
                    />
                    {error && (
                      <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest mt-1">
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={
                      approveMutation.isPending || isGeneratingPdf || isButtonDisabled || isLoadingDetails
                    }
                    className="w-full py-4 font-black uppercase tracking-widest text-[11px] bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed outline-none shadow-sm cursor-pointer"
                  >
                    {approveMutation.isPending || isGeneratingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {approveMutation.isPending
                      ? "Inscribiendo..."
                      : isGeneratingPdf
                        ? "Generando PDF..."
                        : "Confirmar e Inscribir"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
