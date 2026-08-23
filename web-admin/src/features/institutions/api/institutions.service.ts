import { api } from '@/shared/api/client';
import type {
  Institution,
  InstitutionPayload,
  CampaignSettingsPayload,
  AttendanceSettingsPayload,
} from '../types/institutions.types';

export const InstitutionsService = {
  /**
   * Obtiene la ficha de la institución actual.
   */
  getCurrent: async (): Promise<Institution | null> => {
    try {
      const response = await api.get('/institutions/current');
      const data = response.data;
      if (data && typeof data === 'object' && 'id' in data) {
        return data as Institution;
      }
      if (data?.data && typeof data.data === 'object' && 'id' in data.data) {
        return data.data as Institution;
      }
      return null;
    } catch {
      const response = await api.get('/institutions?limit=1');
      const data = response.data;
      const list = Array.isArray(data) ? data : data?.data || [];
      return list.length > 0 ? list[0] : null;
    }
  },

  /**
   * Crea la ficha institucional en el sistema con clave de idempotencia robusta.
   */
  create: async (data: InstitutionPayload): Promise<Institution> => {
    const uuid =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });

    const response = await api.post('/institutions', data, {
      headers: { 'x-idempotency-key': uuid },
    });
    return response.data;
  },

  /**
   * Actualiza la ficha de una institución específica por ID.
   */
  update: async (id: string, data: InstitutionPayload): Promise<Institution> => {
    const response = await api.patch(`/institutions/${id}`, data);
    return response.data;
  },

  /**
   * Obtiene la configuración de la campaña de actualización digital RUDE.
   */
  getCampaignSettings: async (): Promise<CampaignSettingsPayload> => {
    const response = await api.get('/institutions/campaign-settings');
    return response.data;
  },

  /**
   * Actualiza la configuración de la campaña RUDE.
   */
  updateCampaignSettings: async (data: CampaignSettingsPayload): Promise<CampaignSettingsPayload> => {
    const response = await api.patch('/institutions/campaign-settings', data);
    return response.data;
  },

  /**
   * Obtiene la configuración de asistencia y tolerancias.
   */
  getAttendanceSettings: async (): Promise<AttendanceSettingsPayload> => {
    const response = await api.get('/institutions/attendance-settings');
    return response.data;
  },

  /**
   * Actualiza la configuración de asistencia.
   */
  updateAttendanceSettings: async (
    data: AttendanceSettingsPayload,
  ): Promise<AttendanceSettingsPayload> => {
    const response = await api.patch('/institutions/attendance-settings', data);
    return response.data;
  },
};
export type { InstitutionPayload, CampaignSettingsPayload, AttendanceSettingsPayload };
