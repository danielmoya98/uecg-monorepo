import { useState, useEffect, useRef } from 'react'
import { Copy, Loader2, BookOpen, CheckSquare, UserCircle, ChevronDown } from 'lucide-react'
import { DrawerShell } from '@/shared/ui/drawer-shell'
import type { Classroom } from '@/features/classrooms/types/classrooms.types'
import type { TeacherAssignment } from '../types/teacher-assignments.types'


// ==========================================
// COMPONENTE VISUAL: Combobox Suizo Accesible (para Listas)
// ==========================================
interface ListSelectOption {
  value: string
  label: string
}

interface ListSelectProps {
  value: string
  onChange: (v: string) => void
  options: ListSelectOption[]
  disabled?: boolean
  labelId?: string
}

const ListSelect = ({ value, onChange, options, disabled, labelId }: ListSelectProps) => {
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

  const selectedLabel = options.find((o) => o.value === value)?.label || '...'

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
      setIsOpen(true)
      e.preventDefault()
    }
  }

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelId}
        className="w-full flex items-center justify-between border border-uecg-line bg-white px-2 py-2 text-[9px] font-bold uppercase tracking-widest transition-colors focus:outline-none hover:border-uecg-blue focus:border-uecg-blue cursor-pointer disabled:opacity-50"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-3 h-3 shrink-0 transition-transform ${
            isOpen ? 'rotate-180 text-uecg-blue' : 'text-uecg-gray'
          }`}
        />
      </button>
      {isOpen && !disabled && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-0.5 w-full bg-white border border-uecg-line shadow-xl z-[70] max-h-40 overflow-y-auto custom-scrollbar animate-in fade-in"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
              className={`block w-full text-left px-2 py-2 text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                value === opt.value ? 'bg-uecg-blue text-white' : 'text-uecg-gray hover:bg-gray-50'
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

// ==========================================
// DRAWER PRINCIPAL DE CLONACIÓN
// ==========================================
interface CloneAssignmentsDrawerProps {
  isOpen: boolean
  onClose: () => void
  sourceClassroom: Classroom | null
  currentAssignments: TeacherAssignment[]
  teachers: any[]
  classrooms: Classroom[]
  onClone: (payload: {
    targetClassroomIds: string[]
    assignments: { subjectId: string; teacherId: string }[]
  }) => void
  isSubmitting: boolean
}

export const CloneAssignmentsDrawer = ({
  isOpen,
  onClose,
  sourceClassroom,
  currentAssignments,
  teachers,
  classrooms,
  onClone,
  isSubmitting,
}: CloneAssignmentsDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null)

  const [selectedTargets, setSelectedTargets] = useState<string[]>([])
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([])
  const [teacherOverrides, setTeacherOverrides] = useState<Record<string, string>>({})

  // Filtrar los cursos destino del mismo nivel y que no sean el origen
  const targetClassrooms = classrooms.filter(
    (c) => c.level === sourceClassroom?.level && c.id !== sourceClassroom?.id
  )

  useEffect(() => {
    if (isOpen) {
      setSelectedAssignments(currentAssignments.map((a) => a.id))
      const initialOverrides: Record<string, string> = {}
      currentAssignments.forEach((a) => {
        initialOverrides[a.id] = a.teacher.id
      })
      setTeacherOverrides(initialOverrides)
      setSelectedTargets([])
    }
  }, [isOpen, currentAssignments])

  // Accesibilidad: Focus Trapping y Escape Key
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
        if (focusableElements.length === 0) return
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
      const firstBtn = drawerRef.current?.querySelector('button:not([disabled])') as HTMLElement
      firstBtn?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [isOpen, onClose, isSubmitting])

  const handleClone = () => {
    if (selectedTargets.length === 0 || selectedAssignments.length === 0) return
    const assignmentsToClone = currentAssignments
      .filter((a) => selectedAssignments.includes(a.id))
      .map((a) => ({
        subjectId: a.subject.id,
        teacherId: teacherOverrides[a.id] || a.teacher.id,
      }))
    onClone({
      targetClassroomIds: selectedTargets,
      assignments: assignmentsToClone,
    })
  }

  const toggleTarget = (id: string) =>
    setSelectedTargets((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )

  const toggleAssignment = (id: string) =>
    setSelectedAssignments((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )

  const handleTeacherChange = (assignmentId: string, newTeacherId: string) =>
    setTeacherOverrides((prev) => ({ ...prev, [assignmentId]: newTeacherId }))

  if (!sourceClassroom) return null

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title="Malla Curricular"
      kicker="Clonación Inteligente"
      icon={<Copy className="w-5 h-5 text-white" />}
      headerVariant="dark"
      isSubmitting={isSubmitting}
      maxWidth="max-w-[500px]"
    >
      <div className="flex flex-col h-full relative">

            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar flex flex-col gap-6 pb-20">
              {/* Materias a clonar */}
              <section aria-labelledby="section-subjects">
                <h3
                  id="section-subjects"
                  className="text-[10px] font-black uppercase tracking-widest text-uecg-gray border-b border-uecg-line pb-2 mb-3 flex items-center gap-2"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-uecg-blue" /> 1. Configure las Materias a Clonar
                </h3>
                <div className="flex flex-col gap-2">
                  {currentAssignments.map((a) => {
                    const isSelected = selectedAssignments.includes(a.id)
                    return (
                      <div
                        key={a.id}
                        className={`flex flex-col p-3 border transition-all shadow-sm ${
                          isSelected
                            ? 'border-uecg-blue bg-blue-50/10'
                            : 'border-uecg-line bg-gray-50 hover:border-uecg-blue/50'
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isSubmitting}
                              onChange={() => toggleAssignment(a.id)}
                              className="peer w-5 h-5 appearance-none border border-uecg-line bg-white checked:bg-uecg-blue checked:border-uecg-blue transition-all cursor-pointer disabled:opacity-50"
                            />
                            <CheckSquare className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                          </div>
                          <span
                            className={`text-xs font-black uppercase tracking-widest ${
                              isSelected ? 'text-uecg-blue' : 'text-uecg-text'
                            }`}
                          >
                            {a.subject.name}
                          </span>
                        </label>

                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-uecg-line flex flex-col gap-1.5 animate-in fade-in duration-200">
                            <span
                              id={`label-teacher-${a.id}`}
                              className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest flex items-center gap-1"
                            >
                              <UserCircle className="w-3 h-3" /> ¿Quién dictará la materia?
                            </span>
                            <ListSelect
                              value={teacherOverrides[a.id] || ''}
                              onChange={(val) => handleTeacherChange(a.id, val)}
                              options={teachers.map((t) => ({ value: t.id, label: t.fullName }))}
                              disabled={isSubmitting}
                              labelId={`label-teacher-${a.id}`}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* Destinos */}
              <section aria-labelledby="section-targets">
                <h3
                  id="section-targets"
                  className="text-[10px] font-black uppercase tracking-widest text-uecg-gray border-b border-uecg-line pb-2 mb-3 flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-uecg-blue" /> 2. Cursos Destino ({targetClassrooms.length})
                </h3>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar border border-uecg-line p-2 bg-gray-50">
                  {targetClassrooms.length === 0 ? (
                    <p className="text-[9px] uppercase font-bold text-uecg-gray p-4 text-center">
                      No hay otros paralelos para clonar en este nivel.
                    </p>
                  ) : (
                    targetClassrooms.map((c) => {
                      const isSelected = selectedTargets.includes(c.id)
                      return (
                        <label
                          key={c.id}
                          className={`flex items-center gap-3 p-2.5 border transition-all cursor-pointer shadow-sm ${
                            isSelected
                              ? 'border-uecg-blue bg-white'
                              : 'border-uecg-line bg-white hover:border-uecg-blue/50'
                          }`}
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isSubmitting}
                              onChange={() => toggleTarget(c.id)}
                              className="peer w-5 h-5 appearance-none border border-uecg-line bg-white checked:bg-uecg-blue checked:border-uecg-blue transition-all cursor-pointer disabled:opacity-50"
                            />
                            <CheckSquare className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-tight text-uecg-text">
                              {c.grade} "{c.section}"
                            </span>
                            <span className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest">
                              Turno {c.shift}
                            </span>
                          </div>
                        </label>
                      )
                    })
                  )}
                </div>
              </section>
            </div>

            {/* BOTONES ACCIÓN */}
            <div className="p-5 border-t border-uecg-line bg-gray-50 flex gap-3 shrink-0 absolute bottom-0 left-0 w-full z-20">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-uecg-line text-uecg-gray hover:bg-white shadow-sm disabled:opacity-50 outline-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClone}
                disabled={
                  isSubmitting || selectedTargets.length === 0 || selectedAssignments.length === 0
                }
                className="flex-1 py-3 font-black uppercase tracking-widest text-[11px] bg-uecg-dark text-white hover:bg-uecg-blue transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm outline-none cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Clonar Carga
              </button>
            </div>
          </div>
    </DrawerShell>
  )
}

export default CloneAssignmentsDrawer

