import * as z from 'zod'

export const userSchema = z.object({
  fullName: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(50, 'El nombre no puede exceder 50 caracteres.')
    .regex(/^[A-Za-zñÑáéíóúÁÉÍÓÚ_ ]+$/, 'Solo se permiten letras y espacios.'),
  role: z.enum(['ADMIN', 'DOCENTE'], {
    message: 'Debe seleccionar un rol del sistema.',
  }),
})

export type UserFormValues = z.infer<typeof userSchema>
