import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Trash2, AlertTriangle, Loader2, MapPin, UserCheck, Layers } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { classroomFormSchema, type ClassroomFormValues } from '../schemas/classroom.schema'
import { CustomSelect } from './custom-select'
import { ClassroomsService } from '../api/classrooms.service'
import { UsersService } from '@/features/users/api/users.service'
import { InstitutionsService } from '@/features/institutions/api/institutions.service'
import { PhysicalSpacesService } from '@/features/physical-spaces'
import type { Classroom, ClassroomPayload } from '../types/classrooms.types'

interface ClassroomDrawerProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit' | 'delete'
  data?: Classroom | null
  activeYearId?: string
}

const LEVEL_LABELS: Record<string, string> = {
  INICIAL: 'Inicial',
  PRIMARIA: 'Primaria',
  SECUNDARIA: 'Secundaria',
}

const SHIFT_LABELS: Record<string, string> = {
  MANANA: 'Mañana',
  TARDE: 'Tarde',
  NOCHE: 'Noche',
}

const GRADES_REGULAR = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto']
const GRADES_INICIAL = ['Primera Sección', 'Segunda Sección']
const SECTIONS = ['A', 'B', 'C', 'D', 'E']

export const ClassroomDrawer = ({
  isOpen,
  onClose,
  mode,
  data,
  activeYearId,
}: ClassroomDrawerProps) => {
  const queryClient = useQueryClient()
  const drawerRef = useRef<HTMLDivElement>(null)

  // 1. Consultas de Datos de Apoyo
  const { data: institution } = useQuery({
    queryKey: ['currentInstitution'],
    queryFn: InstitutionsService.getCurrent,
    enabled: isOpen && mode !== 'delete',
  })

  const isFixedBaseMode = institution?.schedulingMode === 'FIXED_BASE'

  const { data: usersResult } = useQuery({
    queryKey: ['teachers_list'],
    queryFn: () => UsersService.getAll(1, 100, ''),
    enabled: isOpen && mode !== 'delete',
  })

  const { data: spaces } = useQuery({
    queryKey: ['physicalSpaces'],
    queryFn: () => PhysicalSpacesService.getAll(undefined, true),
    enabled: isOpen && mode !== 'delete' && isFixedBaseMode,
  })

  // Normalización
  const teachers = (() => {
    const list = usersResult?.data || usersResult || []
    return Array.isArray(list) ? list.filter((u: any) => u.role === 'DOCENTE') : []
  })()

  const activeSpaces = spaces || []
  const allowedLevels: string[] = institution?.levels || []
  const allowedShifts: string[] = institution?.shifts || []

  // 2. React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClassroomFormValues>({
    resolver: zodResolver(classroomFormSchema),
    defaultValues: {
      capacity: 35,
      level: 'SECUNDARIA',
      shift: 'MANANA',
      grade: '',
      section: 'A',
      advisorId: null,
      baseRoomId: null,
    },
  })

  const currentLevel = watch('level')
  const currentShift = watch('shift')
  const currentGrade = watch('grade')
  const currentSection = watch('section')
  const currentAdvisor = watch('advisorId')
  const currentBaseRoom = watch('baseRoomId')

  const availableGrades = currentLevel === 'INICIAL' ? GRADES_INICIAL : GRADES_REGULAR

  // 3. Sincronizar Form con datos recibidos en Edit/Delete
  useEffect(() => {
    if (isOpen && data && (mode === 'edit' || mode === 'delete')) {
      reset({
        level: data.level,
        shift: data.shift,
        grade: data.grade,
        section: data.section,
        capacity: data.capacity,
        advisorId: data.advisor?.id || null,
        baseRoomId: data.baseRoom?.id || null,
      })
    } else if (isOpen && mode === 'create') {
      const defaultLevel = (allowedLevels[0] as any) || 'SECUNDARIA'
      reset({
        level: defaultLevel,
        shift: (allowedShifts[0] as any) || 'MANANA',
        grade: defaultLevel === 'INICIAL' ? GRADES_INICIAL[0] : GRADES_REGULAR[0],
        section: 'A',
        capacity: 35,
        advisorId: null,
        baseRoomId: null,
      })
    }
  }, [isOpen, data, mode, reset, allowedLevels, allowedShifts])

  // Ajustar grado automáticamente al cambiar nivel en modo Creación
  useEffect(() => {
    if (mode === 'create' && currentLevel) {
      const firstAvailableGrade = currentLevel === 'INICIAL' ? GRADES_INICIAL[0] : GRADES_REGULAR[0]
      setValue('grade', firstAvailableGrade, { shouldValidate: true })
    }
  }, [currentLevel, mode, setValue])

  // 4. Mutaciones
  const saveMutation = useMutation({
    mutationFn: (payload: ClassroomPayload) => {
      if (mode === 'create') return ClassroomsService.create(payload)
      return ClassroomsService.update(data!.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      onClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ClassroomsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      onClose()
    },
  })

  const handleFormSubmit = (formData: ClassroomFormValues) => {
    if (!activeYearId) return
    if (isFixedBaseMode && !formData.baseRoomId) {
      return
    }

    const payload: ClassroomPayload = {
      ...formData,
      academicYearId: activeYearId,
      advisorId: formData.advisorId === '' ? null : formData.advisorId,
      baseRoomId: isFixedBaseMode && formData.baseRoomId ? formData.baseRoomId : null,
    }
    saveMutation.mutate(payload)
  }

  const isSubmitting = saveMutation.isPending || deleteMutation.isPending

  // 5. Accesibilidad: Focus Trapping y Teclado
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isSubmitting) onClose()
      }
      if (e.key === 'Tab') {
        if (!drawerRef.current) return
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousFocus = document.activeElement as HTMLElement
    
    // Enfocar primer elemento interactivo
    setTimeout(() => {
      const firstInput = drawerRef.current?.querySelector('button:not([disabled])') as HTMLElement
      firstInput?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [isOpen, onClose, isSubmitting])

  const titles = { create: 'Nuevo Curso', edit: 'Editar Curso', delete: 'Eliminar Curso' }
  const headerClasses =
    mode === 'delete' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-uecg-line text-uecg-gray'

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Overlay difuminado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting ? onClose : undefined}
            className="absolute inset-0 bg-uecg-dark/40 backdrop-blur-sm transition-opacity cursor-pointer"
          />

          {/* Panel Lateral Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative h-full w-full max-w-[460px] border-l border-uecg-line bg-white shadow-2xl flex flex-col z-10"
          >
            {/* Header del Cajón */}
            <div className={`flex items-center justify-between border-b p-6 relative overflow-hidden shrink-0 ${headerClasses}`}>
              <div className="absolute -right-8 -top-8 w-24 h-24 border-[6px] border-current opacity-10 rounded-none rotate-45 pointer-events-none"></div>
              <div className="absolute right-12 -bottom-4 w-12 h-12 bg-current opacity-10 -rotate-12 pointer-events-none"></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className={`w-10 h-10 flex items-center justify-center shadow-sm text-white font-black text-lg ${
                  mode === 'delete' ? 'bg-red-600' : 'bg-uecg-blue'
                }`}>
                  {mode === 'delete' ? '!' : currentSection || 'A'}
                </div>
                <div>
                  <span className="label-swiss !mb-0 !text-[9px] text-inherit">Estructura Académica</span>
                  <h2 className={`text-xl font-black uppercase tracking-tighter mt-0.5 ${
                    mode === 'delete' ? 'text-red-700' : 'text-uecg-dark'
                  }`}>
                    {titles[mode]}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="p-1.5 relative z-10 hover:text-red-600 transition-colors focus:outline-none disabled:opacity-50 bg-white/50 rounded-full hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido / Cuerpo con Scroll */}
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar pb-10">
              {mode === 'delete' ? (
                <div className="flex flex-col gap-4">
                  <div className="border border-red-200 bg-red-50 p-6 flex flex-col items-center text-center gap-3 shadow-sm">
                    <AlertTriangle className="w-12 h-12 text-red-600" />
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-red-600">
                        ADVERTENCIA DE SISTEMA
                      </h3>
                      <p className="text-xs font-bold text-red-900 mt-2 uppercase tracking-widest border border-red-200 bg-white px-3 py-1 inline-block">
                        {data?.grade} "{data?.section}" - {data?.level}
                      </p>
                    </div>
                    <p className="text-[10px] text-red-700/80 uppercase tracking-widest leading-relaxed mt-2">
                      Al proceder se desactivará este curso. No podrás eliminar este curso de la gestión si ya cuenta con estudiantes matriculados o calificaciones oficiales.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="px-4 py-3 font-bold uppercase tracking-widest text-[10px] border border-uecg-line hover:bg-gray-50 transition-colors shadow-sm bg-white cursor-pointer outline-none"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => data?.id && deleteMutation.mutate(data.id)}
                      disabled={isSubmitting}
                      className="px-4 py-3 font-black uppercase tracking-widest text-[10px] bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer outline-none"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}{' '}
                      Eliminar Curso
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
                  {/* Inputs ocultos para compatibilidad con React Hook Form */}
                  <input type="hidden" {...register('level')} />
                  <input type="hidden" {...register('shift')} />
                  <input type="hidden" {...register('grade')} />
                  <input type="hidden" {...register('section')} />
                  <input type="hidden" {...register('advisorId')} />
                  <input type="hidden" {...register('baseRoomId')} />

                  {allowedLevels.length === 0 && mode === 'create' && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 text-[10px] uppercase font-bold text-yellow-700 tracking-widest leading-relaxed">
                      ⚠️ No se han configurado los niveles o turnos en el módulo de Institución.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest">
                        Nivel Educativo
                      </span>
                      <CustomSelect
                        value={currentLevel || ''}
                        onChange={(v) => setValue('level', v as any, { shouldValidate: true })}
                        options={allowedLevels.map((l) => ({ value: l, label: LEVEL_LABELS[l] || l }))}
                        placeholder="Seleccione..."
                        disabled={isSubmitting || allowedLevels.length === 0}
                        hasError={!!errors.level}
                      />
                      {errors.level && (
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">
                          {errors.level.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest">
                        Turno RUE
                      </span>
                      <CustomSelect
                        value={currentShift || ''}
                        onChange={(v) => setValue('shift', v as any, { shouldValidate: true })}
                        options={allowedShifts.map((s) => ({ value: s, label: SHIFT_LABELS[s] || s }))}
                        placeholder="Seleccione..."
                        disabled={isSubmitting || allowedShifts.length === 0}
                        hasError={!!errors.shift}
                      />
                      {errors.shift && (
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">
                          {errors.shift.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 border-t border-uecg-line pt-4">
                    <div className="col-span-8 flex flex-col gap-1">
                      <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest">
                        Grado Oficial
                      </span>
                      <CustomSelect
                        value={currentGrade || ''}
                        onChange={(v) => setValue('grade', v, { shouldValidate: true })}
                        options={availableGrades.map((g) => ({ value: g, label: g }))}
                        placeholder="Seleccione..."
                        disabled={isSubmitting}
                        hasError={!!errors.grade}
                      />
                      {errors.grade && (
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">
                          {errors.grade.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-4 flex flex-col gap-1">
                      <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest">
                        Paralelo
                      </span>
                      <CustomSelect
                        value={currentSection || ''}
                        onChange={(v) => setValue('section', v, { shouldValidate: true })}
                        options={SECTIONS.map((s) => ({ value: s, label: `"${s}"` }))}
                        placeholder="Paralelo"
                        disabled={isSubmitting}
                        hasError={!!errors.section}
                      />
                      {errors.section && (
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">
                          {errors.section.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 border-t border-uecg-line pt-4">
                    <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest flex items-center justify-between">
                      Capacidad Máxima del Curso
                      <span className="font-bold lowercase text-uecg-gray">Cupos sugeridos: 35</span>
                    </span>
                    <input
                      type="number"
                      {...register('capacity', { valueAsNumber: true })}
                      disabled={isSubmitting}
                      min={10}
                      max={50}
                      className={`w-full px-3 py-2.5 text-xs border bg-white text-uecg-dark font-black tracking-widest focus:border-uecg-blue outline-none ${
                        errors.capacity ? 'border-red-500' : 'border-uecg-line'
                      }`}
                    />
                    {errors.capacity && (
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">
                        {errors.capacity.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 border-t border-uecg-line pt-4">
                    <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-uecg-gray" /> Docente Tutor (Asesor)
                    </span>
                    <CustomSelect
                      value={currentAdvisor || ''}
                      onChange={(v) => setValue('advisorId', v === '' ? null : v, { shouldValidate: true })}
                      options={[
                        { value: '', label: '-- Sin Tutor --' },
                        ...teachers.map((t: any) => ({ value: t.id, label: t.fullName })),
                      ]}
                      placeholder="Seleccione Tutor"
                      disabled={isSubmitting}
                    />
                  </div>

                  {isFixedBaseMode && (
                    <div className="flex flex-col gap-1 border-t border-uecg-line pt-4">
                      <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-uecg-gray" /> Aula Física Asignada (Base)
                      </span>
                      <CustomSelect
                        value={currentBaseRoom || ''}
                        onChange={(v) => setValue('baseRoomId', v === '' ? null : v, { shouldValidate: true })}
                        options={[
                          { value: '', label: '-- Seleccione Aula Física --' },
                          ...activeSpaces.map((s) => ({ value: s.id, label: s.name })),
                        ]}
                        placeholder="Seleccione Aula Base"
                        disabled={isSubmitting || activeSpaces.length === 0}
                        hasError={isFixedBaseMode && !currentBaseRoom}
                      />
                      {isFixedBaseMode && !currentBaseRoom && (
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">
                          El modo de horario del colegio exige asignar un aula física.
                        </span>
                      )}
                    </div>
                  )}

                  {/* Acciones del Formulario */}
                  <div className="flex gap-4 border-t border-uecg-line pt-6 mt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 border border-uecg-line text-uecg-gray font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 hover:text-uecg-dark transition-colors outline-none bg-transparent shadow-sm cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || (isFixedBaseMode && !currentBaseRoom)}
                      className="flex-1 px-4 py-3 bg-uecg-blue text-white font-black text-[10px] uppercase tracking-widest hover:bg-uecg-dark transition-colors flex justify-center items-center gap-2 outline-none disabled:opacity-50 shadow-sm cursor-pointer"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Layers className="w-3.5 h-3.5" />
                      )}
                      {isSubmitting ? 'Procesando...' : mode === 'create' ? 'Registrar Curso' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
export default ClassroomDrawer
