import { api } from "@/shared/api/client";

export interface PendingEnrollment {
  id: string;
  names: string;
  lastNamePaterno: string;
  lastNameMaterno?: string;
  ci: string;
  enrollmentType: string;
  createdAt: string;
}

export const EnrollmentsService = {
  // 🔥 Ahora pasamos los parámetros de búsqueda al servidor
  getPending: async (page: number, search?: string, type?: string) => {
    const params: Record<string, string | number> = {
      status: "REVISION_SIE",
      limit: 10,
      page,
    };

    if (search) params.search = search;
    if (type && type !== "Todos") params.enrollmentType = type;

    const response = await api.get("/enrollments", { params });
    return response.data;
  },

  approve: async (id: string, rudeCode?: string, receivedDocuments?: Record<string, boolean>): Promise<void> => {
    const payload: Record<string, unknown> = { status: "INSCRITO" };
    if (rudeCode) payload.rudeCode = rudeCode;
    if (receivedDocuments) payload.receivedDocuments = receivedDocuments; // 🔥 Enviamos el JSON

    const response = await api.patch(`/enrollments/${id}`, payload);
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  reject: async (id: string): Promise<void> => {
    const response = await api.patch(`/enrollments/${id}`, {
      status: "RECHAZADO", // Asegúrate de haberlo agregado al schema.prisma de NestJS
    });
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  getDetails: async (id: string) => {
    const response = await api.get(`/enrollments/${id}`);
    const rawData = response.data.data !== undefined ? response.data.data : response.data;

    // 🔥 APLANAMIENTO DE TUTORES PARA EL PDF
    // Extraemos el guardian de la tabla pivote y lo ponemos al mismo nivel
    // que la relación (relationship) para que el PDF lo lea directo.
    if (rawData?.student?.guardians) {
      const flattenedGuardians = rawData.student.guardians.map((pivot: { relationship: string; guardian: Record<string, unknown> }) => ({
        relationship: pivot.relationship,
        ...pivot.guardian, // Desestructuramos todos los datos (ci, names, etc.)
      }));

      // Reemplazamos el arreglo complejo por el aplanado
      rawData.student.guardians = flattenedGuardians;
    }

    return rawData;
  },

  // ==========================================
  // 2. NUEVA LÓGICA PARA "POBLACIÓN ESCOLAR"
  // ==========================================
  // Esta función la usaremos en el nuevo page.tsx (EstudiantesPage)
  getAll: async (params: {
    page: number;
    limit: number;
    search?: string;
    academicYearId?: string;
    status?: string;
    level?: string;
    classroomId?: string;
  }) => {
    const queryParams: Record<string, string | number> = {
      page: params.page,
      limit: params.limit,
    };

    if (params.search) queryParams.search = params.search;
    if (params.academicYearId) queryParams.academicYearId = params.academicYearId;

    // Pasamos el nivel y el curso si existen
    if (params.level) queryParams.level = params.level;
    if (params.classroomId) queryParams.classroomId = params.classroomId;

    // 🔥 CAMBIO CLAVE PARA EL ESTADO:
    if (params.status && params.status !== "TODOS") {
      // Si eligen uno en específico, enviamos ese.
      queryParams.status = params.status;
    } else {
      // Si es "TODOS", excluimos a los RECHAZADOS enviando explícitamente la lista de los permitidos
      queryParams.status = "INSCRITO,REVISION_SIE,RETIRADO";
    }

    const response = await api.get("/enrollments", { params: queryParams });
    return response.data;
  },

  // 🔥 NUEVO: Mutación genérica para cambiar estados (Usada para Dar de Baja)
  updateStatus: async (id: string, status: string): Promise<void> => {
    const response = await api.patch(`/enrollments/${id}`, { status });
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  // 🔥 NUEVO: Obtener detalles LIGEROS para el Kardex Drawer
  getKardex: async (id: string) => {
    const response = await api.get(`/enrollments/${id}/kardex`);
    return response.data.data !== undefined ? response.data.data : response.data;
  },
};
