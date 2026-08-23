import * as z from 'zod'

export const STANDARD_SUBJECT_AREAS = [
  'Ciencia, Tecnología y Producción',
  'Comunidad y Sociedad',
  'Vida, Tierra y Territorio',
  'Cosmos y Pensamiento',
  'Técnica Tecnológica General / Especializada',
] as const

export const subjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Escriba el nombre de la materia (Ej. Matemáticas)')
    .max(100, 'El nombre no puede exceder los 100 caracteres.'),
  code: z
    .string()
    .max(15, 'El código/sigla no puede exceder los 15 caracteres.')
    .optional()
    .or(z.literal('')),
  level: z.enum(['INICIAL', 'PRIMARIA', 'SECUNDARIA'], {
    message: 'Seleccione un nivel',
  }),
  area: z
    .string()
    .max(120, 'El área no puede exceder los 120 caracteres.')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional(),
})

export type SubjectFormValues = z.infer<typeof subjectSchema>


