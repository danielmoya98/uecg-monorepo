import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Save, Loader2, MapPin, ChevronDown } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { PhysicalSpacesService } from '../api/physical-spaces.service'
import { physicalSpaceSchema, type PhysicalSpaceFormValues } from '../schemas/physical-space.schema'
import type { PhysicalSpace, PhysicalSpacePayload } from '../types/physical-spaces.types'

interface Option {
  value: string
  label: string
}

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  hasError,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder: string
  hasError?: boolean
  disabled?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between border bg-white px-3 py-3 text-xs font-bold uppercase tracking-widest transition-colors shadow-sm focus:outline-none ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
        } ${hasError ? 'border-red-500' : 'border-uecg-line hover:border-uecg-blue'}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${
            isOpen ? 'rotate-180 text-uecg-blue' : 'text-uecg-gray'
          }`}
        />
      </button>
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-uecg-line shadow-xl z-[60] max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
              className={`block w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                value === opt.value
                  ? 'bg-uecg-blue text-white'
                  : 'text-uecg-gray hover:bg-gray-50 hover:text-uecg-dark'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface PhysicalSpaceDrawerProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  data?: PhysicalSpace | null
}

export default function PhysicalSpaceDrawer({ isOpen, onClose, mode, data }: PhysicalSpaceDrawerProps) {
  const queryClient = useQueryClient()
  const drawerRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PhysicalSpaceFormValues>({
    resolver: zodResolver(physicalSpaceSchema),
    defaultValues: {
      name: '',
      type: 'SALON',
      isActive: true,
    },
  })

  const currentType = watch('type')

  // Cargar valores iniciales
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && data) {
        reset({
          name: data.name,
          type: data.type,
          isActive: data.isActive,
        })
      } else {
        reset({
          name: '',
          type: 'SALON',
          isActive: true,
        })
      }
    }
  }, [isOpen, mode, data, reset])

  // Mutación
  const mutation = useMutation({
    mutationFn: (payload: PhysicalSpacePayload) => {
      return mode === 'edit' && data
        ? PhysicalSpacesService.update(data.id, payload)
        : PhysicalSpacesService.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physicalSpaces'] })
      toast.success(mode === 'edit' ? 'Espacio actualizado' : 'Espacio registrado con éxito')
      onClose()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Ocurrió un error al procesar la solicitud'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  // Accesibilidad: Focus Trapping y cerrar con Escape
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !mutation.isPending) {
        onClose()
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

    // Enfocar primer elemento interactivo del formulario
    setTimeout(() => {
      const firstInput = drawerRef.current?.querySelector('input[type="text"]') as HTMLElement
      firstInput?.focus()
    }, 150)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [isOpen, onClose, mutation.isPending])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Overlay difuminado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!mutation.isPending ? onClose : undefined}
            className="absolute inset-0 bg-uecg-dark/40 backdrop-blur-sm transition-opacity cursor-pointer"
          />

          {/* Panel Lateral Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative h-full w-full max-w-md border-l border-uecg-line bg-white shadow-2xl flex flex-col z-10"
          >
            {/* HEADER GEOMÉTRICO */}
            <div className="flex items-center justify-between border-b p-6 relative overflow-hidden bg-gray-50 border-uecg-line text-uecg-gray shrink-0">
              <div className="absolute -right-8 -top-8 w-24 h-24 border-[6px] border-current opacity-10 rounded-none rotate-45 pointer-events-none"></div>
              <div className="absolute right-12 -bottom-4 w-12 h-12 bg-current opacity-10 -rotate-12 pointer-events-none"></div>
              <div className="absolute left-1/2 bottom-0 w-8 h-2 bg-current opacity-10 pointer-events-none"></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center shadow-sm text-white font-black text-lg bg-uecg-blue">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="label-swiss !mb-0 !text-[9px] text-inherit">Infraestructura</span>
                  <h2 className="text-xl font-black uppercase tracking-tighter mt-0.5 text-uecg-dark">
                    {mode === 'create' ? 'Nuevo Espacio' : 'Editar Espacio'}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={mutation.isPending}
                className="p-1.5 relative z-10 hover:text-red-600 transition-colors focus:outline-none disabled:opacity-50 bg-white/50 rounded-full hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMULARIO */}
            <form
              onSubmit={handleSubmit((d) => mutation.mutate(d as unknown as PhysicalSpacePayload))}
              className="flex flex-col flex-1 overflow-y-auto p-6 gap-6 custom-scrollbar"
            >
              {/* Inputs ocultos para React Hook Form */}
              <input type="hidden" {...register('type')} />

              <div>
                <label className="label-swiss !text-[10px] !mb-1.5 block">
                  Nombre del Espacio (Identificador Único)
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Ej. Aula 101, Cancha Principal..."
                  disabled={mutation.isPending}
                  className={`w-full border bg-white px-3 py-3 text-xs font-bold uppercase tracking-widest outline-none shadow-sm ${
                    errors.name ? 'border-red-500' : 'border-uecg-line focus:border-uecg-blue'
                  }`}
                />
                {errors.name && (
                  <p className="text-[10px] text-red-500 mt-1.5 font-bold uppercase tracking-widest">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label-swiss !text-[10px] !mb-1.5 block">Tipo de Espacio</label>
                <CustomSelect
                  value={currentType || ''}
                  onChange={(v) => setValue('type', v as any, { shouldValidate: true })}
                  options={[
                    { value: 'SALON', label: 'SALÓN REGULAR' },
                    { value: 'LABORATORIO', label: 'LABORATORIO' },
                    { value: 'CANCHA', label: 'CANCHA / PATIO' },
                    { value: 'AUDITORIO', label: 'AUDITORIO' },
                    { value: 'OTRO', label: 'OTRO ESPACIO' },
                  ]}
                  placeholder="Seleccione..."
                  hasError={!!errors.type}
                  disabled={mutation.isPending}
                />
                {errors.type && (
                  <p className="text-[10px] text-red-500 mt-1.5 font-bold uppercase tracking-widest">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-4 border border-uecg-line p-5 cursor-pointer hover:border-uecg-blue transition-colors shadow-sm bg-white mt-2">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  disabled={mutation.isPending}
                  className="w-5 h-5 accent-uecg-blue cursor-pointer disabled:opacity-50"
                />
                <div>
                  <p className="text-xs font-black uppercase text-uecg-dark tracking-widest">
                    Espacio Habilitado
                  </p>
                  <p className="text-[10px] text-uecg-gray uppercase tracking-widest mt-1 leading-relaxed">
                    Disponible para asignar horarios de clases
                  </p>
                </div>
              </label>

              {/* FOOTER BUTTONS */}
              <div className="mt-auto pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={mutation.isPending}
                  className="flex-1 py-3.5 text-[11px] font-bold uppercase tracking-widest border border-uecg-line text-uecg-gray hover:bg-gray-50 shadow-sm disabled:opacity-50 cursor-pointer bg-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 py-3.5 text-[11px] font-black uppercase tracking-widest bg-uecg-blue text-white hover:bg-uecg-dark transition-colors flex justify-center items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {mutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {mode === 'create' ? 'Guardar' : 'Actualizar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
