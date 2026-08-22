import * as z from 'zod'

export const subjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Escriba el nombre de la materia (Ej. Matemáticas)')
    .max(100, 'El nombre no puede exceder los 100 caracteres.'),
  level: z.enum(['INICIAL', 'PRIMARIA', 'SECUNDARIA'], {
    message: 'Seleccione un nivel',
  }),
  area: z
    .string()
    .max(100, 'El área no puede exceder los 100 caracteres.')
    .optional()
    .or(z.literal('')),
})

export type SubjectFormValues = z.infer<typeof subjectSchema>
