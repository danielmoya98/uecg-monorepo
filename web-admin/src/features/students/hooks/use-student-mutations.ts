import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StudentsService } from "../api/students.service";

interface UseStudentMutationsProps {
  onSuccessAction?: () => void;
  refetchTable?: () => void;
}

export const useStudentMutations = ({ onSuccessAction, refetchTable }: UseStudentMutationsProps = {}) => {
  const queryClient = useQueryClient();

  // 1. Mutación para notificar al estudiante/apoderado
  const notifyMutation = useMutation({
    mutationFn: (enrollmentId: string) => StudentsService.notify(enrollmentId),
    onSuccess: () => {
      toast.success("¡Notificación enviada correctamente!");
      queryClient.invalidateQueries({ queryKey: ["students_population"] });
      refetchTable?.();
      onSuccessAction?.();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Error al enviar la notificación";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    },
  });

  // 2. Mutación para marcar la entrega de folder físico
  const markPhysicalMutation = useMutation({
    mutationFn: (enrollmentId: string) => StudentsService.markPhysicalReceived(enrollmentId),
    onSuccess: () => {
      toast.success("¡Folder físico marcado como ENTREGADO!");
      queryClient.invalidateQueries({ queryKey: ["students_population"] });
      refetchTable?.();
      onSuccessAction?.();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Error al registrar la entrega física";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    },
  });

  return {
    notifyMutation,
    markPhysicalMutation,
  };
};
