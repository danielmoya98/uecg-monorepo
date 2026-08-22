import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { DashboardService } from "../api/dashboard.service";
import type { RootStats, GlobalStats, TeacherStats } from "../types/dashboard.types";

export function useRootStats(options?: Partial<UseQueryOptions<RootStats>>) {
  return useQuery<RootStats>({
    queryKey: ["rootDashboardStats"],
    queryFn: DashboardService.getRootStats,
    refetchInterval: 300000,
    ...options,
  });
}

export function useGlobalStats(options?: Partial<UseQueryOptions<GlobalStats>>) {
  return useQuery<GlobalStats>({
    queryKey: ["globalDashboardStats"],
    queryFn: DashboardService.getGlobalStats,
    refetchInterval: 300000,
    ...options,
  });
}

export function useTeacherStats(options?: Partial<UseQueryOptions<TeacherStats>>) {
  return useQuery<TeacherStats>({
    queryKey: ["teacherDashboardStats"],
    queryFn: DashboardService.getTeacherStats,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
