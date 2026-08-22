import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AcademicYearsService } from "@/features/academic-years/api/academic-years.service";
import { ClassroomsService } from "@/features/classrooms/api/classrooms.service";
import { DataUpdatesService } from "../api/data-updates.service";
import type { BroadcastPreviewData, WhatsappTask } from "../types/data-updates.types";

export const useBroadcastCenter = () => {
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [whatsappTasks, setWhatsappTasks] = useState<WhatsappTask[]>([]);
  const [showPreviewDrawer, setShowPreviewDrawer] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [previewData, setPreviewData] = useState<BroadcastPreviewData | null>(null);

  // 1. Obtener Año Académico Actual
  const { data: currentYear } = useQuery({
    queryKey: ["currentAcademicYear"],
    queryFn: AcademicYearsService.getCurrent,
  });

  // 2. Obtener Aulas del Año Académico
  const { data: classroomsData, isLoading: isLoadingClassrooms } = useQuery({
    queryKey: ["classrooms", currentYear?.id],
    queryFn: () => ClassroomsService.getAll(1, 100, "", currentYear?.id),
    enabled: !!currentYear?.id,
  });

  const classrooms = classroomsData?.data || [];

  // 3. Mutación para analizar canales (Vista previa)
  const analyzeMutation = useMutation({
    mutationFn: (classroomId: string) => DataUpdatesService.getClassroomBroadcastPreview(classroomId),
    onSuccess: (data: any) => {
      const payload = data.projection ? data : data.data;
      if (!payload || !payload.projection) {
        toast.error("Error de formato de servidor.");
        return;
      }
      setPreviewData(payload);
      setShowPreviewDrawer(true);
    },
    onError: (error: any) => {
      toast.error("Error al analizar curso", {
        description: error.response?.data?.message || "Intente nuevamente más tarde.",
      });
    },
  });

  // 4. Mutación para ejecutar la campaña
  const broadcastMutation = useMutation({
    mutationFn: async ({ type, id }: { type: "CLASSROOM" | "ALL"; id?: string }) => {
      if (type === "ALL") return DataUpdatesService.broadcastAll();
      if (type === "CLASSROOM" && id) return DataUpdatesService.broadcastClassroom(id);
      throw new Error("Tipo de difusión inválido");
    },
    onSuccess: (data) => {
      toast.success("Campaña Ejecutada", { description: data.message });
      setShowPreviewDrawer(false);
      if (data.stats?.pendingWhatsApp && data.stats.pendingWhatsApp.length > 0) {
        setWhatsappTasks(data.stats.pendingWhatsApp);
        toast.warning(`Requiere Acción: ${data.stats.pendingWhatsApp.length} chats manuales.`);
      }
    },
    onError: (error: any) => {
      toast.error("Error al ejecutar difusión", {
        description: error.response?.data?.message || "Intente nuevamente más tarde.",
      });
    },
  });

  const handleExecuteConfirmed = useCallback(() => {
    if (!selectedClassroomId) return;
    broadcastMutation.mutate({ type: "CLASSROOM", id: selectedClassroomId });
  }, [selectedClassroomId, broadcastMutation]);

  const handleExecuteMassive = useCallback(() => {
    broadcastMutation.mutate({ type: "ALL" });
  }, [broadcastMutation]);

  return {
    selectedClassroomId,
    setSelectedClassroomId,
    whatsappTasks,
    setWhatsappTasks,
    showPreviewDrawer,
    setShowPreviewDrawer,
    showHelpDrawer,
    setShowHelpDrawer,
    previewData,
    classrooms,
    isLoadingClassrooms,
    isAnalyzing: analyzeMutation.isPending,
    isExecuting: broadcastMutation.isPending,
    analyzeClassroom: analyzeMutation.mutate,
    handleExecuteConfirmed,
    handleExecuteMassive,
  };
};
