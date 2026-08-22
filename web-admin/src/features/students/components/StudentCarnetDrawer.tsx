import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { IdentityService } from "@/features/identity/api/identity.service";
import BaseStudentCarnetDrawer from "@/features/identity/components/student-carnet-drawer";

interface StudentCarnetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: any | null;
}

export default function StudentCarnetDrawer({ isOpen, onClose, enrollment }: StudentCarnetDrawerProps) {
  const queryClient = useQueryClient();
  const { can } = useRouteContext({ from: "/_authenticated" });
  const canManageIdentity = can("create:any", "Identity") || can("manage:all", "all");

  // El ID del estudiante puede estar anidado o plano según la vista (Grid vs Table)
  const studentId = enrollment?.student?.id || enrollment?.studentId || enrollment?.student?.studentId;

  // 1. Obtener la data del QR
  const { data: qrData, isLoading: isLoadingQr } = useQuery({
    queryKey: ["student_qr", studentId],
    queryFn: () => IdentityService.getStudentQR(studentId),
    enabled: isOpen && !!studentId,
  });

  // 2. Mutación para generar un nuevo código QR criptográfico
  const generateMutation = useMutation({
    mutationFn: () => IdentityService.generateQR(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student_qr", studentId] });
    },
  });

  // 3. Mutación para revocar el código QR existente
  const revokeMutation = useMutation({
    mutationFn: () => IdentityService.revokeQR(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student_qr", studentId] });
    },
  });

  // Adaptación de los datos del estudiante para cumplir con la interfaz requerida por el PDF y el carnet
  const adaptedEnrollment = enrollment
    ? {
        ...enrollment,
        student: enrollment.student || {
          id: studentId,
          names: enrollment.names || enrollment.studentName?.split(" ").slice(2).join(" ") || "Estudiante",
          lastNamePaterno: enrollment.lastNamePaterno || enrollment.studentName?.split(" ")[0] || "",
          lastNameMaterno: enrollment.lastNameMaterno || enrollment.studentName?.split(" ")[1] || "",
          ci: enrollment.ci,
        },
      }
    : null;

  return (
    <BaseStudentCarnetDrawer
      isOpen={isOpen}
      onClose={onClose}
      enrollment={adaptedEnrollment}
      qrData={qrData || null}
      isLoadingQr={isLoadingQr}
      isGenerating={generateMutation.isPending}
      isRevoking={revokeMutation.isPending}
      onGenerate={() => generateMutation.mutate()}
      onRevoke={() => revokeMutation.mutate()}
      canManageIdentity={canManageIdentity}
    />
  );
}
