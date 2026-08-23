import { useState, useRef, useEffect } from 'react'
import { Copy, Plus, Loader2, GraduationCap, MapPin, ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Classroom } from '@/features/classrooms/types/classrooms.types'
import type { Subject } from '@/features/subjects/types/subjects.types'
import type { TeacherAssignment } from '../types/teacher-assignments.types'
import AssignmentsTable from './assignments-table'

// ==========================================
// COMPONENTE VISUAL: Combobox Suizo Accesible
// ==========================================
interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder: string
  disabled?: boolean
  hasError?: boolean
  labelId?: string
}

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  hasError,
  labelId,
}: CustomSelectProps) => {
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
        className={`w-full flex items-center justify-between border bg-white px-3 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm focus:outline-none cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-uecg-blue focus:border-uecg-blue'
        } ${hasError ? 'border-red-500' : 'border-uecg-line'}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
            isOpen ? 'rotate-180 text-uecg-blue' : 'text-uecg-gray'
          }`}
        />
      </button>
      {isOpen && !disabled && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-1 w-full bg-white border border-uecg-line shadow-2xl z-[60] max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1"
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
              className={`block w-full text-left px-3 py-2.5 text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
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

// ==========================================
// FORM VALIDATION SCHEMA
// ==========================================
const assignSchema = z.object({
  subjectId: z.string().min(1, 'Seleccione una materia'),
  teacherId: z.string().min(1, 'Seleccione un docente'),
})

type AssignFormValues = z.infer<typeof assignSchema>

// ==========================================
// COMPONENTE PANEL PRINCIPAL
// ==========================================
interface AssignmentPanelProps {
  classroom: Classroom | null
  teachers: any[]
  isFixedBaseMode?: boolean
  canManage: boolean // Propiedad ABAC
  assignments: TeacherAssignment[]
  subjects: Subject[]
  isFetchingAssignments: boolean
  onAssign: (formData: { subjectId: string; teacherId: string }) => void
  isAssignPending: boolean
  onDeleteRequest: (assignment: TeacherAssignment) => void
  onOpenCloneDrawer: (assignments: TeacherAssignment[]) => void
}

export const AssignmentPanel = ({
  classroom,
  teachers,
  isFixedBaseMode,
  canManage,
  assignments,
  subjects,
  isFetchingAssignments,
  onAssign,
  isAssignPending,
  onDeleteRequest,
  onOpenCloneDrawer,
}: AssignmentPanelProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      subjectId: '',
      teacherId: '',
    },
  })

  const currentSubjectId = watch('subjectId')
  const currentTeacherId = watch('teacherId')

  // Reiniciar formulario si cambia el curso seleccionado
  useEffect(() => {
    reset({ subjectId: '', teacherId: '' })
  }, [classroom, reset])

  const onSubmit = (formData: AssignFormValues) => {
    if (!classroom || !canManage) return
    onAssign(formData)
    reset({ subjectId: '', teacherId: '' })
  }

  if (!classroom) {
    return (
      <div className="h-full border border-uecg-line bg-gray-50 flex flex-col items-center justify-center text-center p-10 min-h-[500px] shadow-sm animate-in zoom-in-95 duration-200">
        <div className="relative w-24 h-24 mb-6 opacity-60">
          <div className="absolute top-0 left-0 w-16 h-16 border-[6px] border-uecg-line rounded-none rotate-12"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-gray-200 -rotate-12"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 shadow-sm border border-uecg-line">
            <GraduationCap className="w-8 h-8 text-uecg-gray" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-uecg-dark">Panel de Asignación</h3>
        <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
          Seleccione un curso de la lista lateral para visualizar su carga horaria.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0 shadow-sm border border-uecg-line bg-white relative min-h-[500px]">
      {isFetchingAssignments && (
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden z-20">
          <div className="w-1/3 h-full bg-uecg-blue animate-[ping_1.5s_infinite_ease-in-out] rounded-full"></div>
        </div>
      )}

      {/* HEADER TIPO "TICKET SUIZO" */}
      <div className="bg-uecg-dark text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative overflow-hidden shrink-0">
        <div className="absolute -right-10 -top-10 w-40 h-40 border-[8px] border-white opacity-5 rounded-none rotate-45 pointer-events-none"></div>

        <div className="relative z-10">
          <span className="text-[9px] font-black text-uecg-blue bg-white px-2 py-1 uppercase tracking-widest shadow-sm">
            {classroom.level} • {classroom.shift}
          </span>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mt-3 text-white">
            {classroom.grade} "{classroom.section}"
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-uecg-line uppercase tracking-widest opacity-60">
                Tutor Asignado:
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-white">
                {classroom.advisor?.fullName || 'Sin Asignar'}
              </span>
            </div>
            {isFixedBaseMode && (
              <>
                <span className="hidden sm:block text-white/20">•</span>
                <div className="flex items-center gap-1.5 text-[9px] text-white/80 font-bold uppercase tracking-widest">
                  <MapPin className="w-3 h-3 text-uecg-blue" /> Aula:{' '}
                  <span className="text-white">{classroom.baseRoom?.name || 'N/A'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="relative z-10 w-full md:w-auto">
          {canManage && assignments.length > 0 && (
            <button
              type="button"
              onClick={() => onOpenCloneDrawer(assignments)}
              className="w-full md:w-auto bg-white text-uecg-dark hover:bg-uecg-blue hover:text-white transition-colors px-4 py-3 font-black uppercase tracking-widest text-[10px] shadow-sm flex items-center justify-center gap-2 outline-none cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> Clonar Malla
            </button>
          )}
        </div>
      </div>

      {/* FORMULARIO DE NUEVA VINCULACIÓN */}
      {canManage && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-50 border-b border-uecg-line p-5 md:p-6 shrink-0"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-4 bg-uecg-blue"></div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-uecg-dark">
              Nueva Asignación
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <input type="hidden" {...register('subjectId')} />
            <input type="hidden" {...register('teacherId')} />

            <div className="md:col-span-4">
              <label id="subject-select-label" className="label-swiss !text-[9px] !mb-1.5 block">
                Materia
              </label>
              <CustomSelect
                value={currentSubjectId || ''}
                onChange={(v) => setValue('subjectId', v, { shouldValidate: true })}
                options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                placeholder="-- SELECCIONAR MATERIA --"
                disabled={isAssignPending}
                hasError={!!errors.subjectId}
                labelId="subject-select-label"
              />
            </div>
            <div className="md:col-span-5">
              <label id="teacher-select-label" className="label-swiss !text-[9px] !mb-1.5 block">
                Docente
              </label>
              <CustomSelect
                value={currentTeacherId || ''}
                onChange={(v) => setValue('teacherId', v, { shouldValidate: true })}
                options={teachers.map((t: any) => ({ value: t.id, label: t.fullName }))}
                placeholder="-- SELECCIONAR DOCENTE --"
                disabled={isAssignPending}
                hasError={!!errors.teacherId}
                labelId="teacher-select-label"
              />
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                id="btn-link-teacher-assignment"
                data-tour="btn-link-teacher-assignment"
                disabled={isAssignPending}
                className="w-full py-3 font-black uppercase tracking-widest text-[10px] bg-uecg-dark text-white hover:bg-uecg-blue transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm outline-none cursor-pointer"
              >
                {isAssignPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Vincular
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="flex-1 p-0 overflow-y-auto">
        <AssignmentsTable
          assignments={assignments}
          isFetching={isFetchingAssignments}
          onDeleteRequest={onDeleteRequest}
          canManage={canManage}
        />
      </div>
    </div>
  )
}

export default AssignmentPanel
