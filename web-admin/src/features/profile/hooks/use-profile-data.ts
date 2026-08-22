import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProfileService } from "../api/profile.service";
import type { UserProfile, UpdateProfilePayload } from "../api/profile.service";

export const useProfileData = () => {
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: ProfileService.getProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      ProfileService.updateProfile(data),
    onSuccess: (updatedData: any) => {
      toast.success("PERFIL ACTUALIZADO EXITOSAMENTE");

      queryClient.setQueryData(["userProfile"], (oldData: any) => {
        const userObj = updatedData?.user || updatedData;
        return {
          ...oldData,
          ...userObj,
        };
      });

      const currentUserStr = localStorage.getItem("uecg_user");
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        const userObj = updatedData?.user || updatedData;
        currentUser.fullName = userObj?.fullName || profileData?.fullName;
        localStorage.setItem("uecg_user", JSON.stringify(currentUser));
      }
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || "Error al actualizar perfil";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    },
  });

  return {
    profileData,
    isLoading,
    isSubmitting: updateProfileMutation.isPending,
    updateProfile: updateProfileMutation.mutate,
  };
};
