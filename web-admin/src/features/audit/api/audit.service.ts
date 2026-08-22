import { api } from "@/shared/api/client";
import type { AuditResponse } from "../types/audit.types";

export const AuditService = {
  /**
   * Obtiene los logs de auditoría paginados y filtrados del backend.
   */
  getLogs: async (page: number, limit: number = 10, search?: string): Promise<AuditResponse> => {
    const response = await api.get("/audit", {
      params: { page, limit, search },
    });

    // Desempaquetado seguro para protegernos de cambios estructurales en el backend
    const result = response.data.data !== undefined ? response.data.data : response.data;
    return result as AuditResponse;
  },
};
