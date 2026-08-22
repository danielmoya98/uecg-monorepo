import { useState } from "react";
import { toast } from "sonner";
import { EnrollmentsService } from "../api/enrollments.service";

export const useEnrollmentActions = (canManageEnrollments: boolean, refetch: () => void) => {
  const [isApproveDrawerOpen, setIsApproveDrawerOpen] = useState(false);
  const [selectedEnrollmentForApprove, setSelectedEnrollmentForApprove] = useState<any | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  const handleOpenApproveDrawer = (req: any) => {
    if (!canManageEnrollments) return toast.error("No tienes permisos para aprobar inscripciones.");
    setSelectedEnrollmentForApprove(req);
    setIsApproveDrawerOpen(true);
  };

  const closeApproveDrawer = () => setIsApproveDrawerOpen(false);

  const handleReject = async (id: string) => {
    if (!canManageEnrollments) return toast.error("No tienes permisos para rechazar inscripciones.");
    if (!window.confirm("¿Está seguro de rechazar y bloquear esta solicitud?")) return;

    try {
      await EnrollmentsService.reject(id);
      toast.success("Solicitud de inscripción rechazada");
      refetch();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al rechazar la inscripción";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    }
  };

  const handleGeneratePdf = async (id: string) => {
    if (!canManageEnrollments) return toast.error("Solo Dirección/Secretaría puede generar documentos RUDE.");

    setGeneratingPdfId(id);
    toast.loading("Obteniendo datos del sistema...", { id: "pdf-toast" });

    try {
      const fullData = await EnrollmentsService.getDetails(id);
      toast.loading("Generando documento oficial...", { id: "pdf-toast" });

      // Importaciones dinámicas para no bloquear el bundle inicial
      const { pdf } = await import("@react-pdf/renderer");
      const { default: RudePdfTemplate } = await import("../components/RudePdfTemplate");

      const blob = await pdf(<RudePdfTemplate data={fullData} />).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `RUDE_2026_${fullData.student?.names.replace(/\s+/g, "_") || "Estudiante"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Proceso de impresión finalizado.", { id: "pdf-toast" });
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al generar el documento RUDE";
      toast.error(typeof msg === "string" ? msg : msg[0], { id: "pdf-toast" });
    } finally {
      setGeneratingPdfId(null);
    }
  };

  return {
    isApproveDrawerOpen,
    selectedEnrollmentForApprove,
    generatingPdfId,
    handleOpenApproveDrawer,
    closeApproveDrawer,
    handleReject,
    handleGeneratePdf,
  };
};
