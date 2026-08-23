import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { classPeriodSchema, type ClassPeriodFormValues } from '../schemas/class-periods.schema'
import type { ClassPeriod, ClassPeriodPayload, ShiftType } from '../types/class-periods.types'

interface ClassPeriodFormProps {
  initialData?: ClassPeriod | null
  onSubmit: (payload: ClassPeriodPayload) => void
  onCancel?: () => void
  isPending: boolean
  defaultOrder: number
  selectedShift: ShiftType
}

export default function ClassPeriodForm({
  initialData,
  onSubmit,
  onCancel,
  isPending,
  defaultOrder,
  selectedShift,
}: ClassPeriodFormProps) {
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassPeriodFormValues>({
    resolver: zodResolver(classPeriodSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      startTime: initialData?.startTime ?? '',
      endTime: initialData?.endTime ?? '',
      shift: initialData?.shift ?? selectedShift,
      isBreak: initialData?.isBreak ?? false,
      order: initialData?.order ?? defaultOrder,
      isActive: initialData?.isActive ?? true,
    },
  })

  // Sincronizar los defaultValues del formulario cuando cambien las props del padre o initialData
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        startTime: initialData.startTime,
        endTime: initialData.endTime,
        shift: initialData.shift,
        isBreak: initialData.isBreak,
        order: initialData.order,
        isActive: initialData.isActive ?? true,
      })
    } else {
      reset({
        name: '',
        startTime: '',
        endTime: '',
        shift: selectedShift,
        isBreak: false,
        order: defaultOrder,
        isActive: true,
      })
    }
  }, [initialData, selectedShift, defaultOrder, reset])

  const handleFormSubmit = (data: ClassPeriodFormValues) => {
    onSubmit(data)
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="mb-6 bg-gray-50 border border-uecg-line p-5 shadow-sm"
      noValidate
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div className="md:col-span-4 flex flex-col">
          <label
            htmlFor="period-name"
            className="text-[9px] font-black uppercase tracking-widest text-uecg-gray mb-1.5 block"
          >
            Nombre Oficial
          </label>
          <input
            id="period-name"
            type="text"
            disabled={isPending}
            placeholder="Ej: 1ra Hora"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
            className={`w-full p-2.5 text-xs font-bold uppercase border bg-white outline-none focus:ring-2 focus:ring-uecg-blue/50 focus:border-uecg-blue shadow-inner transition-all duration-150 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <span
              id="name-error"
              className="text-[9px] font-bold text-red-600 uppercase tracking-widest mt-1 block"
            >
              {errors.name.message}
            </span>
          )}
        </div>

        <div className="md:col-span-3 flex flex-col">
          <label
            htmlFor="period-startTime"
            className="text-[9px] font-black uppercase tracking-widest text-uecg-gray mb-1.5 block"
          >
            Inicio
          </label>
          <input
            id="period-startTime"
            type="time"
            disabled={isPending}
            aria-invalid={!!errors.startTime}
            aria-describedby={errors.startTime ? 'startTime-error' : undefined}
            {...register('startTime')}
            className={`w-full p-2.5 text-xs font-black uppercase border bg-white outline-none focus:ring-2 focus:ring-uecg-blue/50 focus:border-uecg-blue text-center shadow-inner transition-all duration-150 ${
              errors.startTime ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.startTime && (
            <span
              id="startTime-error"
              className="text-[9px] font-bold text-red-600 uppercase tracking-widest mt-1 block"
            >
              {errors.startTime.message}
            </span>
          )}
        </div>

        <div className="md:col-span-3 flex flex-col">
          <label
            htmlFor="period-endTime"
            className="text-[9px] font-black uppercase tracking-widest text-uecg-gray mb-1.5 block"
          >
            Fin
          </label>
          <input
            id="period-endTime"
            type="time"
            disabled={isPending}
            aria-invalid={!!errors.endTime}
            aria-describedby={errors.endTime ? 'endTime-error' : undefined}
            {...register('endTime')}
            className={`w-full p-2.5 text-xs font-black uppercase border bg-white outline-none focus:ring-2 focus:ring-uecg-blue/50 focus:border-uecg-blue text-center shadow-inner transition-all duration-150 ${
              errors.endTime ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.endTime && (
            <span
              id="endTime-error"
              className="text-[9px] font-bold text-red-600 uppercase tracking-widest mt-1 block"
            >
              {errors.endTime.message}
            </span>
          )}
        </div>

        <div className="md:col-span-2 flex flex-col">
          <label
            htmlFor="period-order"
            className="text-[9px] font-black uppercase tracking-widest text-uecg-gray mb-1.5 block text-center"
          >
            Posición
          </label>
          <input
            id="period-order"
            type="number"
            min="1"
            disabled={isPending}
            aria-invalid={!!errors.order}
            aria-describedby={errors.order ? 'order-error' : undefined}
            {...register('order', { valueAsNumber: true })}
            className={`w-full p-2.5 text-xs font-black border bg-white outline-none focus:ring-2 focus:ring-uecg-blue/50 focus:border-uecg-blue text-center shadow-inner transition-all duration-150 ${
              errors.order ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.order && (
            <span
              id="order-error"
              className="text-[9px] font-bold text-red-600 uppercase tracking-widest mt-1 block text-center"
            >
              {errors.order.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-5 pt-5 border-t border-gray-200 gap-4">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              id="period-isBreak"
              type="checkbox"
              disabled={isPending}
              {...register('isBreak')}
              className="w-5 h-5 accent-yellow-500 cursor-pointer focus:ring-2 focus:ring-yellow-400 focus:outline-none rounded transition-all duration-150 disabled:cursor-not-allowed"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-uecg-dark group-hover:text-yellow-600 transition-colors">
              Descanso / Recreo
            </span>
          </label>

          {isEditing && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                id="period-isActive"
                type="checkbox"
                disabled={isPending}
                {...register('isActive')}
                className="w-5 h-5 accent-uecg-blue cursor-pointer focus:ring-2 focus:ring-uecg-blue/50 focus:outline-none rounded transition-all duration-150 disabled:cursor-not-allowed"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-uecg-dark group-hover:text-uecg-blue transition-colors">
                Activo
              </span>
            </label>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              disabled={isPending}
              onClick={onCancel}
              className="px-5 py-3 border border-gray-300 text-uecg-gray text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all duration-200 shadow-sm outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          )}
          <button
            disabled={isPending}
            type="submit"
            className="px-8 py-3 bg-uecg-dark text-white text-[10px] font-black uppercase tracking-widest hover:bg-black active:scale-[0.98] transition-all duration-200 shadow-sm outline-none w-full sm:w-auto text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-uecg-dark/50"
          >
            {isPending
              ? 'Guardando...'
              : isEditing
                ? 'Guardar Cambios'
                : 'Registrar Periodo'}
          </button>
        </div>
      </div>
    </form>
  )
}

