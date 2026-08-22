import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProfileService } from "../api/profile.service";

export const useChangePassword = (onSuccessCallback?: () => void) => {
  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      ProfileService.changePassword(data),
    onSuccess: () => {
      toast.success("CONTRASEÑA ACTUALIZADA EXITOSAMENTE");
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        "La contraseña actual es incorrecta o hubo un error.";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    },
  });

  return {
    changePassword: passwordMutation.mutate,
    isSubmitting: passwordMutation.isPending,
  };
};
