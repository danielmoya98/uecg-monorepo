import { useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { subjectSchema } from '../schemas/subject.schema'
import type { SubjectFormValues } from '../schemas/subject.schema'
import type { Subject } from '../types/subjects.types'
import SwissSelect from './swiss-select'

const LEVEL_LABELS: Record<string, string> = {
  INICIAL: 'Inicial',
  PRIMARIA: 'Primaria',
  SECUNDARIA: 'Secundaria',
}

interface SubjectFormProps {
  mode: 'create' | 'edit'
  initialData?: Subject | null
  allowedLevels: string[]
  isSubmitting: boolean
  onSubmit: (data: SubjectFormValues) => void
  isOpen: boolean
}

export default function SubjectForm({
  mode,
  initialData,
  allowedLevels,
  isSubmitting,
  onSubmit,
  isOpen,
}: SubjectFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
  })

  const currentLevel = watch('level')

  // Hidratación reactiva del formulario al abrir
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        reset({
          name: initialData.name,
          level: initialData.level,
          area: initialData.area || '',
        })
      } else if (mode === 'create') {
        const defaultLevel = (allowedLevels[0] as 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA') || 'SECUNDARIA'
        reset({
          name: '',
          level: defaultLevel,
          area: '',
        })
      }
    }
  }, [isOpen, mode, initialData, reset, allowedLevels])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 h-full pb-6">
      {/* Input oculto para registro con RHF */}
      <input type="hidden" {...register('level')} />

      {allowedLevels.length === 0 && mode === 'create' && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 text-[10px] uppercase font-bold text-yellow-700 tracking-widest leading-relaxed">
          ⚠️ No se han configurado los niveles en el módulo de Institución. Vaya a "Configuración RUE" antes
          de crear materias.
        </div>
      )}

      <div>
        <label htmlFor="subject-name-input" className="label-swiss !text-[10px] !mb-1.5 block">
          Nombre Oficial de la Asignatura
        </label>
        <input
          id="subject-name-input"
          type="text"
          {...register('name')}
          placeholder="Ej. Matemáticas"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={`w-full border bg-white px-3 py-3 text-uecg-text focus:outline-none focus:ring-2 focus:ring-uecg-blue uppercase text-xs font-bold tracking-widest shadow-sm transition-colors ${
            errors.name ? 'border-red-500' : 'border-uecg-line focus:border-uecg-blue'
          }`}
          disabled={isSubmitting}
          required
        />
        {errors.name && (
          <p
            id="name-error"
            className="text-[10px] text-red-500 mt-1.5 font-bold uppercase tracking-widest"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="subject-level-select" className="label-swiss !text-[10px] !mb-1.5 block">
          Nivel Educativo (Donde se dicta)
        </label>
        <SwissSelect
          value={currentLevel || ''}
          onChange={(v) => setValue('level', v as any, { shouldValidate: true })}
          options={allowedLevels.map((lvl) => ({
            value: lvl,
            label: LEVEL_LABELS[lvl] || lvl,
          }))}
          placeholder="Seleccione Nivel"
          disabled={isSubmitting || allowedLevels.length === 0}
          hasError={!!errors.level}
        />
        {errors.level && (
          <p className="text-[10px] text-red-500 mt-1.5 font-bold uppercase tracking-widest">
            {errors.level.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="subject-area-input" className="label-swiss !text-[10px] !mb-1.5 block">
          Área de Conocimiento (Opcional)
        </label>
        <input
          id="subject-area-input"
          type="text"
          {...register('area')}
          placeholder="Ej. Ciencias Exactas"
          className="w-full border border-uecg-line bg-white px-3 py-3 text-uecg-text focus:border-uecg-blue focus:outline-none focus:ring-2 focus:ring-uecg-blue uppercase text-xs font-bold tracking-widest shadow-sm transition-colors"
          disabled={isSubmitting}
        />
      </div>

      {/* Botón flotante al final del drawer */}
      <button
        type="submit"
        disabled={isSubmitting || allowedLevels.length === 0}
        className="mt-auto w-full py-3.5 font-black uppercase tracking-widest text-[11px] bg-uecg-blue text-white hover:bg-uecg-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-uecg-blue"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {mode === 'create' ? 'Guardar Materia' : 'Actualizar Materia'}
      </button>
    </form>
  )
}
