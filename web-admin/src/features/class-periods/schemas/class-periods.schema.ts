import { z } from 'zod'

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

const toMinutes = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export const classPeriodSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'El nombre es requerido')
      .max(50, 'El nombre no debe exceder los 50 caracteres'),
    startTime: z.string().regex(timeRegex, 'Hora de inicio inválida (formato HH:MM)'),
    endTime: z.string().regex(timeRegex, 'Hora de fin inválida (formato HH:MM)'),
    shift: z.enum(['MANANA', 'TARDE', 'NOCHE'], {
      message: 'El turno es requerido',
    }),
    isBreak: z.boolean(),
    order: z
      .number({
        message: 'La posición debe ser un número',
      })
      .int('La posición debe ser un número entero')
      .min(1, 'La posición debe ser igual o mayor a 1'),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true
      return toMinutes(data.endTime) > toMinutes(data.startTime)
    },
    {
      message: 'La hora de fin debe ser posterior a la de inicio',
      path: ['endTime'],
    },
  )

export type ClassPeriodFormValues = z.infer<typeof classPeriodSchema>

