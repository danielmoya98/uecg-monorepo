import * as z from 'zod';

export const institutionSchema = z.object({
  rueCode: z.string().min(1, 'El código RUE es obligatorio'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
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
  ], {
    message: 'Seleccione un departamento',
  }),
  municipality: z.string().min(1, 'El municipio es obligatorio'),
  district: z.string().min(1, 'El distrito es obligatorio'),
  address: z.string().min(1, 'La dirección es obligatoria'),
  phone: z.string().optional(),
  email: z.string().email('Correo inválido').or(z.literal('')).optional(),
  foundedYear: z.union([
    z.coerce.number().min(1800, 'Año inválido').max(2100, 'Año inválido'),
    z.literal(''),
  ]).optional(),
  shifts: z.array(z.string()).min(1, 'Debe seleccionar al menos un turno'),
  levels: z.array(z.string()).min(1, 'Debe seleccionar al menos un nivel educativo'),
  schedulingMode: z.enum(['FIXED_BASE', 'DYNAMIC']),
});

export type InstitutionFormValues = z.infer<typeof institutionSchema>;

export const campaignSettingsSchema = z.object({
  enableDigitalRudeUpdates: z.boolean(),
  maxRudeUpdatesPerYear: z.coerce
    .number()
    .int()
    .min(1, 'Mínimo 1 envío')
    .max(5, 'Máximo 5 envíos'),
  activeNotificationChannels: z.array(z.string()),
});

export type CampaignSettingsFormValues = z.infer<typeof campaignSettingsSchema>;

export const attendanceSettingsSchema = z.object({
  enableQrAttendance: z.boolean(),
  enableBiometricAttendance: z.boolean(),
  lateToleranceMinutes: z.coerce
    .number()
    .int()
    .min(0, 'Debe ser mayor o igual a 0'),
  absentToleranceMinutes: z.coerce
    .number()
    .int()
    .min(0, 'Debe ser mayor o igual a 0'),
  notificationFrequency: z.string().min(1, 'Seleccione la frecuencia de notificación'),
});

export type AttendanceSettingsFormValues = z.infer<typeof attendanceSettingsSchema>;
