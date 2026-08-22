import * as z from 'zod'

export const physicalSpaceSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe ser más descriptivo y tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  type: z.enum(['SALON', 'LABORATORIO', 'CANCHA', 'AUDITORIO', 'OTRO'], {
    message: 'Seleccione una categoría válida',
  }),
  isActive: z.boolean(),
})

export type PhysicalSpaceFormValues = z.infer<typeof physicalSpaceSchema>
