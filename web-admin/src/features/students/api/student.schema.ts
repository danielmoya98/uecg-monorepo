import * as z from "zod";

const requiredString = z.string().min(1, "Obligatorio");

// ✅ FIX: nunca devuelve undefined
const optionalString = z.string().optional().default("");

const optionalArray = z.array(z.string()).optional().default([]);

export const rudeSchema = z
  .object({
    // --- DATOS INSTITUCIONALES ---
    enrollmentType: z.enum(["NUEVO", "ANTIGUO", "TRASPASO", "EXTRANJERO"]),

    rudeCode: optionalString,
    classroomId: requiredString,

    // --- ESTUDIANTE ---
    names: requiredString,
    lastNamePaterno: requiredString,
    lastNameMaterno: optionalString,

    // --- NACIMIENTO ---
    birthCountry: z.string().default("BOLIVIA"),
    birthDepartment: optionalString,
    birthProvince: optionalString,
    birthLocality: optionalString,
    birthDate: requiredString,

    // --- CERTIFICADO ---
    certOficialia: optionalString,
    certLibro: optionalString,
    certPartida: optionalString,
    certFolio: optionalString,

    // --- IDENTIFICACIÓN ---
    documentType: z.string().default("CI"),
    ci: optionalString,
    complement: optionalString,
    expedition: optionalString,
    gender: z.enum(["MASCULINO", "FEMENINO"]),

    // --- DISCAPACIDAD ---
    hasDisability: z.boolean().default(false),
    disabilityRegistry: optionalString,
    disabilityCode: optionalString,
    disabilityType: optionalString,
    disabilityDegree: optionalString,
    disabilityOrigin: optionalString,

    // --- TEA ---
    hasAutism: z.boolean().default(false),
    autismType: optionalString,

    // --- APRENDIZAJE ---
    learningDisabilityStatus: z.enum(["DIAGNOSTICO", "INFORME", "SIN_DIAGNOSTICO", "NO"]).default("NO"),
    learningDisabilityTypes: optionalArray,
    learningSupportLocation: optionalArray,

    // --- TALENTO ---
    hasExtraordinaryTalent: z.boolean().default(false),
    talentType: optionalString,
    talentSpecifics: optionalArray,
    talentIQ: optionalString,
    talentModality: optionalArray,

    // --- DIRECCIÓN ---
    department: requiredString,
    province: requiredString,
    municipality: requiredString,
    locality: optionalString,
    zone: optionalString,
    street: requiredString,
    houseNumber: optionalString,
    phone: optionalString,
    cellphone: requiredString,

    // --- SOCIOECONÓMICO ---
    nativeLanguage: requiredString,
    frequentLanguages: optionalString,
    culturalIdentity: optionalString,

    nearestHealthCenter: z.boolean().default(false),
    healthCareLocations: optionalArray,
    healthCenterVisits: optionalString,
    healthInsurance: z.boolean().default(false),

    water: z.boolean().default(false),
    bathroom: z.boolean().default(false),
    sewage: z.boolean().default(false),
    electricity: z.boolean().default(false),
    garbage: z.boolean().default(false),
    housingType: optionalString,

    internetAccess: optionalArray,
    internetFrequency: optionalString,

    // --- TRABAJO ---
    didWork: z.string().default("NO"),
    workedMonths: optionalArray,
    workType: optionalString,
    workShift: optionalArray,
    workFrequency: optionalString,
    gotPaid: optionalString,

    transportType: requiredString,
    transportTime: requiredString,

    abandonedLastYear: z.boolean().default(false),
    abandonReasons: optionalArray,

    // --- VIVE CON ---
    livesWith: requiredString,

    // --- TUTORES ---
    guardians: z
      .array(
        z.object({
          relationship: z.enum(["PADRE", "MADRE", "TUTOR", "TUTOR_EXTRAORDINARIO"]),
          ci: requiredString,
          complement: optionalString,
          expedition: optionalString,
          lastNamePaterno: requiredString,
          lastNameMaterno: optionalString,
          names: requiredString,
          language: optionalString,
          occupation: optionalString,
          educationLevel: optionalString,
          birthDate: optionalString,
          phone: requiredString,
          jobTitle: optionalString,
          institution: optionalString,
        })
      )
      .min(1, "Debe registrar al menos un tutor"),
  })
  .superRefine((data, ctx) => {
    if (["TRASPASO", "ANTIGUO"].includes(data.enrollmentType)) {
      if (!data.rudeCode.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Obligatorio para ${data.enrollmentType.toLowerCase()}`,
          path: ["rudeCode"],
        });
      }
    }

    if (data.hasDisability) {
      if (!data.disabilityCode.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese Nro de Carnet",
          path: ["disabilityCode"],
        });
      }
      if (!data.disabilityType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Seleccione el tipo", path: ["disabilityType"] });
      }
    }

    if (data.birthCountry === "BOLIVIA" && !data.birthDepartment.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Obligatorio", path: ["birthDepartment"] });
    }

    if (data.hasAutism && !data.autismType) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Seleccione TEA", path: ["autismType"] });
    }

    if (data.learningDisabilityStatus !== "NO" && data.learningDisabilityTypes.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleccione al menos una dificultad",
        path: ["learningDisabilityTypes"],
      });
    }

    if (data.hasExtraordinaryTalent) {
      if (!data.talentType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Seleccione talento", path: ["talentType"] });
      }
      if (!data.talentIQ.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CI obligatorio", path: ["talentIQ"] });
      }
    }

    if (data.didWork === "SI" && !data.workType) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Especifique actividad", path: ["workType"] });
    }

    if (data.abandonedLastYear && data.abandonReasons.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indique una razón",
        path: ["abandonReasons"],
      });
    }
  });

// 1. Tipo para React Hook Form (El Input que permite undefined)
export type RudeFormValues = z.input<typeof rudeSchema>;

// 2. Tipo estricto para tu Servicio/API (El Output limpio sin undefined)
export type RudePayload = z.infer<typeof rudeSchema>;
