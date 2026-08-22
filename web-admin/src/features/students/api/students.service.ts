import { api } from "@/shared/api/client";
import type { RudeFormValues } from "./student.schema";

export const StudentsService = {
    registerPublicRude: async (academicYearId: string, data: RudeFormValues) => {
        const payload = {
            academicYearId,
            classroomId: data.classroomId,
            enrollmentType: data.enrollmentType,
            rudeCode: data.rudeCode,

            // --- 1. DATOS DEL ESTUDIANTE (Tabla Student) ---
            names: data.names,
            lastNamePaterno: data.lastNamePaterno,
            lastNameMaterno: data.lastNameMaterno,
            birthCountry: data.birthCountry,
            birthDepartment: data.birthDepartment,
            birthProvince: data.birthProvince,
            birthLocality: data.birthLocality,
            birthDate: data.birthDate,

            certOficialia: data.certOficialia,
            certLibro: data.certLibro,
            certPartida: data.certPartida,
            certFolio: data.certFolio,

            documentType: data.documentType,
            ci: data.ci,
            complement: data.complement,
            expedition: data.expedition,
            gender: data.gender,

            // Discapacidad y Salud Especial (Tabla Student)
            hasDisability: data.hasDisability,
            disabilityRegistry: data.disabilityRegistry,
            disabilityCode: data.disabilityCode,
            disabilityType: data.disabilityType,
            disabilityDegree: data.disabilityDegree,
            disabilityOrigin: data.disabilityOrigin,
            hasAutism: data.hasAutism,
            autismType: data.autismType,
            learningDisabilityStatus: data.learningDisabilityStatus,
            learningDisabilityTypes: data.learningDisabilityTypes || [],
            learningSupportLocation: data.learningSupportLocation || [],
            hasExtraordinaryTalent: data.hasExtraordinaryTalent,
            talentType: data.talentType,
            talentSpecifics: data.talentSpecifics || [],
            talentIQ: data.talentIQ,
            talentModality: data.talentModality || [],

            // --- 2. DATOS DE LOS TUTORES (Tabla Guardian) ---
            guardians: data.guardians,

            // --- 3. DATOS SOCIOECONÓMICOS (Tabla RudeRecord) ---
            rudeData: {
                // Dirección
                department: data.department,
                province: data.province,
                municipality: data.municipality,
                locality: data.locality,
                zone: data.zone,
                street: data.street,
                houseNumber: data.houseNumber,
                phone: data.phone,
                cellphone: data.cellphone,

                // Idiomas y Cultura
                nativeLanguage: data.nativeLanguage,
                // Convertimos el string de idiomas a un array para Prisma
                frequentLanguages: data.frequentLanguages ? data.frequentLanguages.split(",").map((s) => s.trim()) : [],
                culturalIdentity: data.culturalIdentity,

                // Salud
                nearestHealthCenter: data.nearestHealthCenter,
                healthCareLocations: data.healthCareLocations || [],
                healthCenterVisits: data.healthCenterVisits,
                healthInsurance: data.healthInsurance,

                // Servicios
                water: data.water,
                bathroom: data.bathroom,
                sewage: data.sewage,
                electricity: data.electricity,
                garbage: data.garbage,
                housingType: data.housingType,

                // Internet
                internetAccess: data.internetAccess || [],
                internetFrequency: data.internetFrequency,

                // Trabajo
                didWork: data.didWork,
                workedMonths: data.workedMonths || [],
                workType: data.workType,
                workShift: data.workShift || [],
                workFrequency: data.workFrequency,
                gotPaid: data.gotPaid,

                // Transporte
                transportType: data.transportType,
                transportTime: data.transportTime,

                // Abandono
                abandonedLastYear: data.abandonedLastYear,
                abandonReasons: data.abandonReasons || [],

                // Con quién vive
                livesWith: data.livesWith,
            },
        };

        const response = await api.post(`/students/register-rude`, payload, {
            headers: { "x-idempotency-key": crypto.randomUUID() },
        });
        return response.data;
    },

    importExcel: async (academicYearId: string, file: File, statusChoice: string, classroomId: string) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("status", statusChoice);
        formData.append("classroomId", classroomId); // Mandamos el curso

        const response = await api.post(`/students/import-excel/${academicYearId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    notify: async (enrollmentId: string) => {
        const response = await api.post(`/data-updates/broadcast/${enrollmentId}`, {});
        return response.data;
    },

    markPhysicalReceived: async (enrollmentId: string) => {
        const response = await api.patch(`/enrollments/${enrollmentId}`, {
            receivedDocuments: { physicalFolder: true }
        });
        return response.data;
    },
};
