import { api } from "@/shared/api/client";
import type { DataUpdateRequest, BroadcastResponse, BroadcastPreviewData } from "../types/data-updates.types";

export const DataUpdatesService = {
  // 1. Obtener lista de solicitudes pendientes
  getPending: async (): Promise<DataUpdateRequest[]> => {
    const response = await api.get("/data-updates/pending");
    const data = response.data;
    return data?.data !== undefined ? data.data : data;
  },

  // 2. Aprobar actualización
  approve: async (id: string): Promise<any> => {
    const response = await api.post(`/data-updates/${id}/approve`);
    const data = response.data;
    return data?.data !== undefined ? data.data : data;
  },

  // 3. Rechazar actualización
  reject: async (id: string, reason: string): Promise<any> => {
    const response = await api.patch(`/data-updates/${id}/reject`, { reason });
    const data = response.data;
    return data?.data !== undefined ? data.data : data;
  },

  // 4. Generar enlace seguro para enviar por WhatsApp
  generateLink: async (enrollmentId: string): Promise<{ token: string; url: string }> => {
    const response = await api.post(`/data-updates/generate-link/${enrollmentId}`);
    const data = response.data;
    return data?.data !== undefined ? data.data : data;
  },

  // 🔥 4. NUEVO: Disparo Individual (Notificación Push)
  broadcastIndividual: async (enrollmentId: string): Promise<any> => {
    const response = await api.post(`/data-updates/broadcast/${enrollmentId}`);
    const data = response.data;
    return data?.data !== undefined ? data.data : data;
  },

  // 🔥 5. NUEVO: Marcar RUDE como Físico (Papel)
  markPhysical: async (enrollmentId: string): Promise<any> => {
    const response = await api.patch(`/data-updates/${enrollmentId}/mark-physical`);
    const data = response.data;
    return data?.data !== undefined ? data.data : data;
  },

  // 🔥 6. NUEVO: Previsualizar difusión por Curso
  getClassroomBroadcastPreview: async (classroomId: string): Promise<BroadcastPreviewData> => {
    const response = await api.get(`/data-updates/broadcast/classroom/${classroomId}/preview`);
    const data = response.data;
    return data?.data !== undefined ? data.data : data;
  },

  // 🔥 7. NUEVO: Disparo por Curso
  broadcastClassroom: async (classroomId: string): Promise<BroadcastResponse> => {
    const response = await api.post(`/data-updates/broadcast/classroom/${classroomId}`);
    const data = response.data;
    return data?.data !== undefined ? data.data : data;
  },

  // 🔥 8. NUEVO: Disparo Masivo (Todo el colegio)
  broadcastAll: async (): Promise<BroadcastResponse> => {
    const response = await api.post(`/data-updates/broadcast/all`);
    const data = response.data;
    return data?.data !== undefined ? data.data : data;
  },
};
