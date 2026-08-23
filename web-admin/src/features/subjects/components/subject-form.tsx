import { useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  subjectSchema,
  STANDARD_SUBJECT_AREAS,
} from '../schemas/subject.schema'
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
  const currentIsActive = watch('isActive')

  // Hidratación reactiva del formulario al abrir
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        reset({
          name: initialData.name,
          code: initialData.code || '',
          level: initialData.level,
          area: initialData.area || '',
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        })
      } else if (mode === 'create') {
        const defaultLevel =
          (allowedLevels[0] as 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA') ||
          'SECUNDARIA'
        reset({
          name: '',
          code: '',
          level: defaultLevel,
          area: '',
          isActive: true,
        })
      }
    }
  }, [isOpen, mode, initialData, reset, allowedLevels])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 h-full pb-6">
      {/* Input oculto para registro con RHF */}
      <input type="hidden" {...register('level')} />

      {allowedLevels.length === 0 && mode === 'create' && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 text-[10px] uppercase font-bold text-yellow-700 tracking-widest leading-relaxed">
          ⚠️ No se han configurado los niveles en el módulo de Institución. Vaya a &quot;Configuración RUE&quot; antes
          de crear materias.
        </div>
      )}

      {/* Nombre oficial */}
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
          className={`w-full border bg-white px-3 py-2.5 text-uecg-text focus:outline-none focus:ring-2 focus:ring-uecg-blue uppercase text-xs font-bold tracking-widest shadow-sm transition-colors ${
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

      {/* Código o Sigla */}
      <div>
        <label htmlFor="subject-code-input" className="label-swiss !text-[10px] !mb-1.5 block">
          Sigla / Código Oficial (Opcional)
        </label>
        <input
          id="subject-code-input"
          type="text"
          {...register('code')}
          placeholder="Ej. MAT, FIS, LENG"
          maxLength={15}
          className="w-full border border-uecg-line bg-white px-3 py-2.5 text-uecg-text focus:border-uecg-blue focus:outline-none focus:ring-2 focus:ring-uecg-blue uppercase text-xs font-bold tracking-widest shadow-sm transition-colors"
          disabled={isSubmitting}
        />
        <p className="text-[9px] text-uecg-gray mt-1 uppercase font-bold tracking-wider">
          Utilizado en vistas condensadas de horarios y boletines.
        </p>
      </div>

      {/* Nivel Educativo */}
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

      {/* Área / Campo de Saberes con Datalist de Sugerencias */}
      <div>
        <label htmlFor="subject-area-input" className="label-swiss !text-[10px] !mb-1.5 block">
          Área / Campo de Saberes (RUE / SEP)
        </label>
        <input
          id="subject-area-input"
          type="text"
          list="standard-areas-list"
          {...register('area')}
          placeholder="Ej. Ciencia, Tecnología y Producción"
          className="w-full border border-uecg-line bg-white px-3 py-2.5 text-uecg-text focus:border-uecg-blue focus:outline-none focus:ring-2 focus:ring-uecg-blue uppercase text-xs font-bold tracking-widest shadow-sm transition-colors"
          disabled={isSubmitting}
        />
        <datalist id="standard-areas-list">
          {STANDARD_SUBJECT_AREAS.map((area) => (
            <option key={area} value={area} />
          ))}
        </datalist>
      </div>

      {/* Estado Activo en Edición */}
      {mode === 'edit' && (
        <div className="p-3 border border-uecg-line bg-gray-50/70 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-uecg-dark">
              Estado de la Materia
            </p>
            <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-wider mt-0.5">
              {currentIsActive
                ? 'Activa (disponible para asignaciones)'
                : 'Inactiva (oculta en nuevos cursos)'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentIsActive ?? true}
              onChange={(e) =>
                setValue('isActive', e.target.checked, { shouldValidate: true })
              }
              className="sr-only peer"
              disabled={isSubmitting}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-uecg-blue"></div>
          </label>
        </div>
      )}

      {/* Botón de Guardado */}
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
