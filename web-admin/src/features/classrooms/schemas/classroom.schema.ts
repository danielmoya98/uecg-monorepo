import * as z from 'zod'

export const classroomFormSchema = z.object({
  level: z.enum(['INICIAL', 'PRIMARIA', 'SECUNDARIA'], {
    message: 'Seleccione un nivel educativo',
  }),
  shift: z.enum(['MANANA', 'TARDE', 'NOCHE'], {
    message: 'Seleccione un turno RUE',
  }),
  grade: z.string().min(1, 'Seleccione un grado oficial'),
  section: z.string().min(1, 'Seleccione un paralelo'),
  capacity: z.number()
    .min(10, 'El mínimo de cupos permitido es 10')
    .max(50, 'El máximo de cupos permitido es 50'),
  advisorId: z.string().optional().nullable(),
  baseRoomId: z.string().optional().nullable(),
})

export type ClassroomFormValues = z.infer<typeof classroomFormSchema>
