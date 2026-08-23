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

export interface UserSessionItem {
  id: string;
  deviceType: 'WEB' | 'MOBILE_ANDROID' | 'MOBILE_IOS' | 'MOBILE_FLUTTER' | 'UNKNOWN';
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent?: boolean;
}

export interface SecurityLogItem {
  id: string;
  method: string;
  route: string;
  statusCode: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
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

  getSessions: async (): Promise<UserSessionItem[]> => {
    const response = await api.get("/auth/sessions");
    return response.data?.sessions || [];
  },

  revokeSession: async (sessionId: string) => {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  revokeOtherSessions: async () => {
    const response = await api.delete("/auth/sessions/other");
    return response.data;
  },

  getSecurityLogs: async (): Promise<SecurityLogItem[]> => {
    const response = await api.get("/auth/security-logs");
    return response.data?.logs || [];
  },
};
