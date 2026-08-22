import { api } from "@/shared/api/client";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  ci?: string;
  phone?: string;
  address?: string;
  specialty?: string;
}

export type UpdateProfilePayload = Omit<
  UserProfile,
  "id" | "email" | "role" | "status"
>;

export const ProfileService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data: UpdateProfilePayload) => {
    const response = await api.patch("/users/profile", data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.post("/users/profile/change-password", data);
    return response.data;
  },
};
