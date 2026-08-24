import { useEffect } from 'react'
import { AlertTriangle, Info, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DrawerShell } from '@/shared/ui/drawer-shell'
import { academicYearFormSchema, type AcademicYearFormValues } from '../schemas/academic-years.schema'
import type { AcademicYearData, AcademicYearPayload } from '../types/academic-years.types'

export type DrawerMode = 'create' | 'edit' | 'delete'

interface AcademicYearDrawerProps {
  isOpen: boolean
  onClose: () => void
  mode: DrawerMode
  data?: AcademicYearData | null
  onSubmit: (payload: AcademicYearPayload) => void
  onDelete: (id: string) => void
  isSubmitting: boolean
}

export default function AcademicYearDrawer({
  isOpen,
  onClose,
  mode,
  data,
  onSubmit,
  onDelete,
  isSubmitting,
}: AcademicYearDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearFormSchema),
    defaultValues: { status: 'PLANNING' },
  })

  const currentStatus = watch('status')
  const isCreating = mode === 'create'

  // Sincronizar formulario al cambiar datos o modo
  useEffect(() => {
    if (isOpen && data && (mode === 'edit' || mode === 'delete')) {
      reset({
        year: data.year,
        name: data.name,
        startDate: data.startDate.substring(0, 10),
        endDate: data.endDate.substring(0, 10),
        status: data.status,
      })
    } else if (isOpen && mode === 'create') {
      const currentYearValue = new Date().getFullYear()
      reset({
        year: currentYearValue,
        name: `Gestión Académica ${currentYearValue}`,
        startDate: '',
        endDate: '',
        status: 'PLANNING',
      })
    }
  }, [isOpen, data, mode, reset])

  const handleFormSubmit = (formData: AcademicYearFormValues) => {
    const payload: AcademicYearPayload = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    }
    onSubmit(payload)
  }

  const titles = { create: 'Nueva Gestión', edit: 'Editar Gestión', delete: 'Eliminar Gestión' }

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title={titles[mode]}
      kicker="Calendario Escolar"
      icon={mode === 'delete' ? '!' : (data?.year ? String(data.year).slice(-2) : '+')}
      headerVariant={mode === 'delete' ? 'danger' : 'default'}
      isSubmitting={isSubmitting}
      maxWidth="max-w-[420px]"
    >
      {/* Contenido */}
      <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              {mode === 'delete' ? (
                <div className="flex flex-col gap-4">
                  <div className="border border-red-200 bg-red-50 p-5 flex flex-col items-center text-center gap-3">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-red-600">
                        ¿ELIMINAR GESTIÓN?
                      </h3>
                      <p className="text-xs font-bold text-uecg-text mt-1.5 uppercase tracking-widest">
                        {data?.name}
                      </p>
                    </div>
                    <p className="text-[10px] text-red-700/80 uppercase tracking-widest mt-2">
                      Esta acción es irreversible.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="px-4 py-2.5 font-bold uppercase tracking-widest text-[10px] border border-uecg-line hover:bg-gray-50 cursor-pointer outline-none"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => data?.id && onDelete(data.id)}
                      disabled={isSubmitting}
                      className="px-4 py-2.5 font-bold uppercase tracking-widest text-[10px] bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer outline-none"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>Eliminar</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 flex flex-col gap-1.5">
                      <label htmlFor="year-field" className="label-swiss !text-[10px]">
                        Año
                      </label>
                      <input
                        id="year-field"
                        type="number"
                        {...register('year', { valueAsNumber: true })}
                        className={`w-full border bg-transparent px-3 py-2.5 text-uecg-text focus:outline-none font-bold text-xs ${
                          errors.year ? 'border-red-500' : 'border-uecg-line focus:border-uecg-blue'
                        }`}
                        disabled={isSubmitting}
                        aria-invalid={!!errors.year}
                      />
                      {errors.year && (
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                          {errors.year.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <label htmlFor="name-field" className="label-swiss !text-[10px]">
                        Nombre Oficial
                      </label>
                      <input
                        id="name-field"
                        type="text"
                        {...register('name')}
                        className={`w-full border bg-transparent px-3 py-2.5 text-uecg-text focus:outline-none uppercase text-xs font-bold ${
                          errors.name ? 'border-red-500' : 'border-uecg-line focus:border-uecg-blue'
                        }`}
                        disabled={isSubmitting}
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && (
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                          {errors.name.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="startDate-field" className="label-swiss !text-[10px]">
                        Fecha Inicio
                      </label>
                      <input
                        id="startDate-field"
                        type="date"
                        {...register('startDate')}
                        className={`w-full border bg-transparent px-3 py-2.5 text-uecg-text focus:outline-none uppercase text-xs font-bold ${
                          errors.startDate ? 'border-red-500' : 'border-uecg-line focus:border-uecg-blue'
                        }`}
                        disabled={isSubmitting}
                        aria-invalid={!!errors.startDate}
                      />
                      {errors.startDate && (
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                          {errors.startDate.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="endDate-field" className="label-swiss !text-[10px]">
                        Fecha Fin
                      </label>
                      <input
                        id="endDate-field"
                        type="date"
                        {...register('endDate')}
                        className={`w-full border bg-transparent px-3 py-2.5 text-uecg-text focus:outline-none uppercase text-xs font-bold ${
                          errors.endDate ? 'border-red-500' : 'border-uecg-line focus:border-uecg-blue'
                        }`}
                        disabled={isSubmitting}
                        aria-invalid={!!errors.endDate}
                      />
                      {errors.endDate && (
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                          {errors.endDate.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="status-field" className="label-swiss !text-[10px]">
                      Estado de la Gestión
                    </label>
                    <select
                      id="status-field"
                      {...register('status')}
                      className="w-full border border-uecg-line bg-transparent px-3 py-2.5 text-uecg-text focus:border-uecg-blue focus:outline-none uppercase text-[11px] font-bold cursor-pointer"
                      disabled={isSubmitting}
                    >
                      <option value="PLANNING">En Planificación (Futuro)</option>
                      <option value="ACTIVE">Activa (Gestión Actual)</option>
                      {!isCreating && <option value="CLOSED">Cerrada (Histórico)</option>}
                    </select>
                  </div>

                  {currentStatus === 'ACTIVE' && (
                    <div className="bg-blue-50 border border-blue-200 p-3 flex gap-3 mt-2">
                      <Info className="w-4 h-4 text-uecg-blue shrink-0 mt-0.5" />
                      <p className="text-[9px] font-bold text-uecg-blue uppercase tracking-widest leading-relaxed">
                        Al guardar como "ACTIVA", el sistema cerrará automáticamente cualquier otra gestión
                        que esté en curso.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 w-full py-3 font-bold uppercase tracking-widest text-[11px] bg-uecg-blue text-white hover:bg-uecg-dark transition-colors flex items-center justify-center gap-2 cursor-pointer outline-none"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>Guardar Cambios</>
                    )}
                  </button>
                </form>
              )}
            </div>
    </DrawerShell>
  )
}

