import * as z from 'zod'

export const physicalSpaceSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe ser más descriptivo y tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  type: z.enum(['SALON', 'LABORATORIO', 'CANCHA', 'AUDITORIO', 'OTRO'], {
    message: 'Seleccione una categoría válida',
  }),
  capacity: z
    .number()
    .int()
    .positive('La capacidad debe ser un número positivo')
    .max(1000, 'La capacidad máxima es 1000')
    .optional()
    .nullable(),
  building: z.string().max(100).optional().nullable(),
  floor: z.string().max(50).optional().nullable(),
  description: z.string().max(255).optional().nullable(),
  isActive: z.boolean(),
})

export type PhysicalSpaceFormValues = z.infer<typeof physicalSpaceSchema>
