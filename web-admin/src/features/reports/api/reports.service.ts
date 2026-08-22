import { api } from "@/shared/api/client";

export interface MassiveBulletinsPayload {
  academicYearId: string;
  classroomId?: string;
  level?: string;
}

export const ReportsService = {
  /**
   * Obtiene los datos académicos y de calificaciones estructurados en JSON para un boletín individual
   * de un estudiante (Libreta Oficial Ley 070). El frontend procesará este JSON y renderizará
   * la Libreta en el cliente con @react-pdf/renderer.
   * 
   * @param enrollmentId ID de la inscripción del estudiante.
   * @returns Datos estructurados de la libreta Ley 070.
   */
  getIndividualBulletinData: async (enrollmentId: string) => {
    const response = await api.get(`/reports/bulletin/${enrollmentId}`);
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  /**
   * Disparador de generación masiva de boletines académicos (Para Directores/Administradores).
   * Envía una solicitud al servidor para registrar y procesar la exportación masiva
   * en segundo plano a través de una cola de BullMQ.
   * 
   * @param payload Datos del año académico y filtros opcionales (curso o nivel).
   * @returns Datos de respuesta del servidor sobre la tarea encolada.
   */
  requestMassiveBulletins: async (payload: MassiveBulletinsPayload) => {
    const response = await api.post("/reports/bulletins/massive", payload);
    return response.data;
  },
};
