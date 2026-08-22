import { api } from "@/shared/api/client";

export const PublicUpdatesService = {
  // 1. Verifica el token y trae los datos actuales del alumno
  verifyToken: async (token: string): Promise<any> => {
    const response = await api.get(`/data-updates/public/verify/${token}`);
    const data = response.data;
    return data?.data !== undefined ? data.data : data;
  },

  // 2. Envía el formulario lleno a la "cuarentena"
  submitUpdate: async (token: string, proposedData: any): Promise<any> => {
    const response = await api.post(`/data-updates/public/submit/${token}`, proposedData);
    const data = response.data;
    return data?.data !== undefined ? data.data : data;
  },
};
