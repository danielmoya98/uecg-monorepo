import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(
      1,
      'El correo es obligatorio',
    )
    .email('Correo inválido'),

  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres'),
})

export type LoginFormValues = z.infer<
  typeof loginSchema
>

export const setupPasswordSchema = z
  .object({
    tempPassword: z.string().min(1),

    newPassword: z.string().min(6),

    confirmPassword: z.string().min(1),
  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      message:
        'Las contraseñas no coinciden',

      path: ['confirmPassword'],
    },
  )

export type SetupPasswordValues =
  z.infer<
    typeof setupPasswordSchema
  >
