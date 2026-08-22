import * as z from 'zod'

export const academicYearFormSchema = z
  .object({
    year: z.number().min(2020, 'El año debe ser 2020 o superior'),
    name: z.string().min(3, 'Mínimo 3 caracteres'),
    startDate: z.string().min(1, 'Seleccione la fecha de inicio'),
    endDate: z.string().min(1, 'Seleccione la fecha de fin'),
    status: z.enum(['PLANNING', 'ACTIVE', 'CLOSED']),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['endDate'],
  })

export type AcademicYearFormValues = z.infer<typeof academicYearFormSchema>
