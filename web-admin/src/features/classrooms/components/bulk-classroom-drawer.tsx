import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Layers, Loader2, MapPin } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { CustomSelect } from './custom-select'
import { ClassroomsService } from '../api/classrooms.service'
import { InstitutionsService } from '@/features/institutions/api/institutions.service'
import { PhysicalSpacesService } from '@/features/physical-spaces'
import type { BulkClassroomPayload } from '../types/classrooms.types'

interface BulkClassroomDrawerProps {
  isOpen: boolean
  onClose: () => void
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

export const BulkClassroomDrawer = ({
  isOpen,
  onClose,
  activeYearId,
}: BulkClassroomDrawerProps) => {
  const queryClient = useQueryClient()
  const drawerRef = useRef<HTMLDivElement>(null)

  // 1. Consultas de Datos de Apoyo
  const { data: institution, isLoading: isLoadingInst } = useQuery({
    queryKey: ['currentInstitution'],
    queryFn: InstitutionsService.getCurrent,
    enabled: isOpen,
  })

  const isFixedBaseMode = institution?.schedulingMode === 'FIXED_BASE'

  const { data: spaces } = useQuery({
    queryKey: ['physicalSpaces'],
    queryFn: () => PhysicalSpacesService.getAll(undefined, true),
    enabled: isOpen && isFixedBaseMode,
  })

  const allowedLevels: string[] = institution?.levels || []
  const allowedShifts: string[] = institution?.shifts || []
  const activeSpaces = spaces || []

  // 2. Estados Locales de Formulario Masivo
  const [level, setLevel] = useState<string>('')
  const [shift, setShift] = useState<string>('')
  const [section, setSection] = useState('A')
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [capacities, setCapacities] = useState<Record<string, number>>({})
  const [baseRooms, setBaseRooms] = useState<Record<string, string>>({})

  const availableGrades = level === 'INICIAL' ? GRADES_INICIAL : GRADES_REGULAR

  // Inicializar nivel y turno por defecto
  useEffect(() => {
    if (isOpen) {
      if (allowedLevels.length > 0 && !level) setLevel(allowedLevels[0])
      if (allowedShifts.length > 0 && !shift) setShift(allowedShifts[0])
    }
  }, [isOpen, allowedLevels, allowedShifts, level, shift])

  // Limpiar estados al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSelectedGrades([])
      setCapacities({})
      setBaseRooms({})
      setSection('A')
    }
  }, [isOpen])

  // Gestores de cambio
  const handleToggleGrade = (grade: string) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades((prev) => prev.filter((g) => g !== grade))
      const newCaps = { ...capacities }
      delete newCaps[grade]
      setCapacities(newCaps)

      const newRooms = { ...baseRooms }
      delete newRooms[grade]
      setBaseRooms(newRooms)
    } else {
      setSelectedGrades([...selectedGrades, grade])
      setCapacities({ ...capacities, [grade]: 35 })
      setBaseRooms({ ...baseRooms, [grade]: '' })
    }
  }

  const handleSelectAll = () => {
    if (selectedGrades.length === availableGrades.length) {
      setSelectedGrades([])
      setCapacities({})
      setBaseRooms({})
    } else {
      setSelectedGrades([...availableGrades])
      const newCaps: Record<string, number> = {}
      const newRooms: Record<string, string> = {}
      availableGrades.forEach((g) => {
        newCaps[g] = 35
        newRooms[g] = ''
      })
      setCapacities(newCaps)
      setBaseRooms(newRooms)
    }
  }

  const handleCapacityChange = (grade: string, value: string) => {
    const num = parseInt(value)
    setCapacities({ ...capacities, [grade]: isNaN(num) ? 0 : num })
  }

  const handleRoomChange = (grade: string, value: string) => {
    setBaseRooms({ ...baseRooms, [grade]: value })
  }

  // 3. Mutación
  const bulkMutation = useMutation({
    mutationFn: (payload: BulkClassroomPayload) => ClassroomsService.createBulk(payload),
    onSuccess: (data) => {
      if (data.createdCount > 0) {
        toast.success(`Éxito: ${data.message}`)
      } else {
        toast.warning('No se creó ningún curso (es posible que ya existieran).')
      }
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      onClose()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al procesar la creación masiva'
      toast.error(typeof msg === 'string' ? msg : msg[0])
    },
  })

  const handleSave = () => {
    if (!activeYearId) return toast.error('No hay una gestión escolar activa.')
    if (selectedGrades.length === 0) return toast.error('Seleccione al menos un grado.')

    const payload: BulkClassroomPayload = {
      academicYearId: activeYearId,
      level: level as any,
      shift: shift as any,
      classrooms: selectedGrades.map((grade) => ({
        grade,
        section,
        capacity: capacities[grade] || 35,
        baseRoomId: isFixedBaseMode && baseRooms[grade] ? baseRooms[grade] : null,
      })),
    }

    bulkMutation.mutate(payload)
  }

  const isProcessing = bulkMutation.isPending

  // 4. Accesibilidad: Focus Trapping y Teclado
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isProcessing) onClose()
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

    setTimeout(() => {
      const firstInput = drawerRef.current?.querySelector('button:not([disabled])') as HTMLElement
      firstInput?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [isOpen, onClose, isProcessing])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Overlay interactivo optimizado para GPU */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={!isProcessing ? onClose : undefined}
            className="absolute inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu cursor-pointer"
          />

          {/* Panel Lateral Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="relative h-full w-full max-w-[460px] border-l border-uecg-line bg-white shadow-2xl flex flex-col z-10 will-change-transform transform-gpu"
          >
            {/* Header del Cajón */}
            <div className="flex items-center justify-between border-b border-uecg-line bg-gray-50 p-6 relative overflow-hidden text-uecg-gray shrink-0">
              <div className="absolute -right-6 -top-6 w-24 h-24 border-[8px] border-current opacity-10 rounded-none rotate-12 pointer-events-none"></div>
              <div className="absolute right-10 -bottom-4 w-12 h-12 border-[4px] border-current opacity-10 -rotate-12 pointer-events-none"></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-10 h-10 bg-uecg-blue text-white flex items-center justify-center shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="label-swiss !mb-0 !text-[9px] text-inherit">Estructura Académica</span>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-uecg-dark mt-0.5">
                    Creación Masiva
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="p-1.5 relative z-10 text-uecg-gray hover:text-red-600 transition-colors disabled:opacity-50 outline-none bg-white/50 rounded-full hover:bg-red-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido / Cuerpo con Scroll */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-5 custom-scrollbar">
              {isLoadingInst && (
                <div className="flex items-center gap-2 text-uecg-blue bg-blue-50 p-3 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando configuración del RUE...
                </div>
              )}
              {allowedLevels.length === 0 && !isLoadingInst && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 text-[10px] uppercase font-bold text-yellow-700 tracking-widest leading-relaxed">
                  ⚠️ No se han configurado los niveles o turnos en el módulo de Institución.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-uecg-gray uppercase tracking-widest leading-none">Nivel Educativo</label>
                  <CustomSelect
                    value={level}
                    onChange={(val) => {
                      setLevel(val)
                      setSelectedGrades([])
                      setCapacities({})
                      setBaseRooms({})
                    }}
                    options={allowedLevels.map((l) => ({ value: l, label: LEVEL_LABELS[l] || l }))}
                    placeholder="Seleccione Nivel"
                    disabled={isProcessing || allowedLevels.length === 0}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-uecg-gray uppercase tracking-widest leading-none">Turno RUE</label>
                  <CustomSelect
                    value={shift}
                    onChange={setShift}
                    options={allowedShifts.map((s) => ({ value: s, label: SHIFT_LABELS[s] || s }))}
                    placeholder="Seleccione Turno"
                    disabled={isProcessing || allowedShifts.length === 0}
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[9px] font-black text-uecg-gray uppercase tracking-widest leading-none">Paralelo Común a Crear</label>
                  <CustomSelect
                    value={section}
                    onChange={setSection}
                    options={SECTIONS.map((s) => ({ value: s, label: `Paralelo "${s}"` }))}
                    placeholder="Seleccione Paralelo"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <hr className="border-uecg-line" />

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-uecg-gray uppercase tracking-widest leading-none">Selección de Grados</label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={isProcessing || allowedLevels.length === 0}
                    className="text-[9px] font-bold uppercase tracking-widest text-uecg-blue hover:text-uecg-dark transition-colors outline-none cursor-pointer"
                  >
                    {selectedGrades.length === availableGrades.length && availableGrades.length > 0
                      ? 'Desmarcar Todos'
                      : 'Seleccionar Todos'}
                  </button>
                </div>

                <div className="flex flex-col gap-3 pb-4">
                  {availableGrades.map((grade) => {
                    const isSelected = selectedGrades.includes(grade)
                    return (
                      <div
                        key={grade}
                        className={`flex flex-col p-3 border transition-colors shadow-sm ${
                          isSelected
                            ? 'border-uecg-blue bg-blue-50/10'
                            : 'border-uecg-line bg-white hover:border-uecg-blue/50'
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleGrade(grade)}
                            disabled={isProcessing}
                            className="w-5 h-5 appearance-none border border-uecg-line bg-white checked:bg-uecg-blue checked:border-uecg-blue transition-all cursor-pointer disabled:cursor-not-allowed"
                            aria-label={`Seleccionar grado ${grade}`}
                          />
                          <span
                            className={`text-xs font-bold uppercase tracking-widest ${
                              isSelected ? 'text-uecg-blue font-black' : 'text-uecg-text'
                            }`}
                          >
                            {grade}
                          </span>
                        </label>

                        {isSelected && (
                          <div className="flex gap-3 mt-3 pt-3 border-t border-uecg-line/50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col gap-1 w-20 shrink-0">
                              <span className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest">
                                Cupos
                              </span>
                              <input
                                type="number"
                                value={capacities[grade] === 0 ? '' : capacities[grade]}
                                onChange={(e) => handleCapacityChange(grade, e.target.value)}
                                disabled={isProcessing}
                                min={10}
                                max={50}
                                className="w-full px-2 py-2 text-xs text-center border border-uecg-line bg-white font-black text-uecg-dark focus:border-uecg-blue outline-none"
                              />
                            </div>

                            {isFixedBaseMode && (
                              <div className="flex flex-col gap-1 flex-1">
                                <span className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5" /> Aula Base (Opcional)
                                </span>
                                <CustomSelect
                                  value={baseRooms[grade] || ''}
                                  onChange={(val) => handleRoomChange(grade, val)}
                                  options={[
                                    { value: '', label: '-- Sin Asignar --' },
                                    ...activeSpaces.map((s) => ({
                                      value: s.id,
                                      label: s.name,
                                    })),
                                  ]}
                                  placeholder="-- Seleccionar --"
                                  disabled={isProcessing || activeSpaces.length === 0}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer de Cajón */}
            <div className="p-5 border-t border-uecg-line bg-gray-50 flex gap-4 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 border border-uecg-line text-uecg-gray font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-uecg-dark transition-colors outline-none bg-transparent shadow-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isProcessing || selectedGrades.length === 0 || allowedLevels.length === 0}
                className="flex-1 px-4 py-3 bg-uecg-blue text-white font-black text-[10px] uppercase tracking-widest hover:bg-uecg-dark transition-colors flex justify-center items-center gap-2 outline-none disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Layers className="w-3.5 h-3.5" />
                )}
                {isProcessing ? 'Procesando...' : `Crear ${selectedGrades.length} Cursos`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
export default BulkClassroomDrawer
