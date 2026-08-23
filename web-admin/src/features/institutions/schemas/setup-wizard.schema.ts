import * as z from 'zod';

export const setupWizardSchema = z.object({
  // 1. Directora / Admin
  fullName: z.string().min(3, 'El nombre completo debe tener al menos 3 caracteres'),
  email: z.string().email('Ingrese un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  ci: z.string().min(4, 'El CI es requerido para la acreditación legal'),
  phone: z.string().optional(),

  // 2. Institución RUE
  rueCode: z.string().min(1, 'El código RUE/SIE es obligatorio'),
  institutionName: z.string().min(3, 'El nombre del colegio debe tener al menos 3 caracteres'),
  dependencyType: z.enum(['FISCAL', 'PRIVADA', 'CONVENIO']),
  department: z.enum([
    'CHUQUISACA',
    'LA_PAZ',
    'COCHABAMBA',
    'SANTA_CRUZ',
    'POTOSI',
    'ORURO',
    'TARIJA',
    'BENI',
    'PANDO',
  ]),
  municipality: z.string().min(1, 'El municipio es obligatorio'),
  district: z.string().min(1, 'El distrito educativo es obligatorio'),
  address: z.string().min(1, 'La dirección física es obligatoria'),
  institutionPhone: z.string().optional(),
  institutionEmail: z.string().email('Correo institucional inválido').or(z.literal('')).optional(),
  foundedYear: z.union([
    z.coerce.number().min(1800, 'Año inválido').max(2100, 'Año inválido'),
    z.literal(''),
  ]).optional(),
  shifts: z.array(z.string()).min(1, 'Debe seleccionar al menos un turno'),
  levels: z.array(z.string()).min(1, 'Debe seleccionar al menos un nivel educativo'),

  // 3. Reglas Iniciales
  schedulingMode: z.enum(['FIXED_BASE', 'DYNAMIC']),
  enableQrAttendance: z.boolean(),
  lateToleranceMinutes: z.coerce.number().min(0).max(180),
  absentToleranceMinutes: z.coerce.number().min(0).max(180),
});

export type SetupWizardFormValues = z.infer<typeof setupWizardSchema>;
