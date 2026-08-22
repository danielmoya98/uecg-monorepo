import { api } from "@/shared/api/client";
import { RootStats, GlobalStats, TeacherStats } from "../types/dashboard.types";

export const DashboardService = {
  getRootStats: async (): Promise<RootStats> => {
    const response = await api.get<RootStats>("/dashboard/root");
    return response.data;
  },

  getGlobalStats: async (): Promise<GlobalStats> => {
    const response = await api.get<GlobalStats>("/dashboard/global");
    return response.data;
  },

  getTeacherStats: async (): Promise<TeacherStats> => {
    const response = await api.get<TeacherStats>("/dashboard/teacher");
    return response.data;
  },
};
