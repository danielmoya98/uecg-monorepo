import { useEffect, useRef, useState } from 'react'
import { UserCheck, Loader2, ChevronDown } from 'lucide-react'
import { DrawerShell } from '@/shared/ui/drawer-shell'
import type { TeacherAssignment } from '../types/teacher-assignments.types'

interface Option {
  value: string
  label: string
}

interface ReassignTeacherDrawerProps {
  isOpen: boolean
  onClose: () => void
  assignment: TeacherAssignment | null
  teachers: any[]
  onConfirm: (payload: { id: string; teacherId: string }) => void
  isSubmitting: boolean
}

export const ReassignTeacherDrawer = ({
  isOpen,
  onClose,
  assignment,
  teachers,
  onConfirm,
  isSubmitting,
}: ReassignTeacherDrawerProps) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (assignment) {
      setSelectedTeacherId(assignment.teacher.id)
    }
  }, [assignment])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isOpen || !assignment) return null

  const teacherOptions: Option[] = teachers.map((t: any) => ({
    value: t.id,
    label: t.fullName,
  }))

  const selectedTeacherLabel =
    teacherOptions.find((o) => o.value === selectedTeacherId)?.label ||
    '-- SELECCIONAR NUEVO DOCENTE --'

  const handleSave = () => {
    if (selectedTeacherId && selectedTeacherId !== assignment.teacher.id) {
      onConfirm({ id: assignment.id, teacherId: selectedTeacherId })
    }
  }

  const isSaveDisabled =
    isSubmitting ||
    !selectedTeacherId ||
    selectedTeacherId === assignment.teacher.id

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title="Reasignar Titular"
      kicker="CARGA HORARIA"
      icon={<UserCheck className="w-5 h-5 text-white" />}
      headerVariant="dark"
      maxWidth="max-w-lg"
      isSubmitting={isSubmitting}
    >
      <div className="flex flex-col h-full justify-between bg-white dark:bg-[#121214]">
        {/* CUERPO DEL DRAWER */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar flex flex-col gap-6">
          {/* Ficha de Asignatura */}
          <div className="border border-uecg-line bg-gray-50 dark:bg-zinc-900/50 p-5 shadow-sm">
            <span className="text-[9px] font-bold text-uecg-gray dark:text-zinc-400 uppercase tracking-widest block">
              Materia y Paralelo
            </span>
            <p className="text-base font-black uppercase tracking-tight text-uecg-dark dark:text-zinc-100 mt-1">
              {assignment.subject.name}
            </p>
            <p className="text-[10px] font-bold text-uecg-gray dark:text-zinc-400 uppercase tracking-wider mt-1">
              {assignment.classroom.grade} "{assignment.classroom.section}" • {assignment.classroom.level}
            </p>
          </div>

          {/* Docente Actual */}
          <div>
            <span className="label-swiss !text-[9px] !mb-1.5 block">
              Docente Titular Actual:
            </span>
            <p className="text-xs font-black uppercase text-uecg-gray dark:text-zinc-300 tracking-wider bg-gray-100 dark:bg-zinc-800 p-3 border border-uecg-line dark:border-zinc-700">
              {assignment.teacher.fullName}
            </p>
          </div>

          {/* Selector de Nuevo Docente */}
          <div>
            <label className="label-swiss !text-[9px] !mb-1.5 block">
              Nuevo Docente a Asignar:
            </label>
            <div className="relative w-full" ref={selectRef}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                className="w-full flex items-center justify-between border border-uecg-line bg-white dark:bg-zinc-900 dark:border-zinc-700 px-3.5 py-3 text-[10px] font-bold uppercase tracking-widest hover:border-uecg-blue transition-colors shadow-sm focus:outline-none cursor-pointer"
              >
                <span className="truncate">{selectedTeacherLabel}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isSelectOpen ? 'rotate-180 text-uecg-blue' : 'text-uecg-gray'
                  }`}
                />
              </button>

              {isSelectOpen && (
                <div className="absolute top-full mt-1 left-0 w-full bg-white dark:bg-zinc-900 border border-uecg-line dark:border-zinc-700 shadow-2xl z-[70] max-h-56 overflow-y-auto custom-scrollbar">
                  {teacherOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedTeacherId(opt.value)
                        setIsSelectOpen(false)
                      }}
                      className={`block w-full text-left px-4 py-3 text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                        selectedTeacherId === opt.value
                          ? 'bg-uecg-blue text-white'
                          : 'text-uecg-gray dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-uecg-dark dark:hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nota Institucional */}
          <p className="text-[10px] text-blue-900 dark:text-blue-200 font-medium leading-relaxed bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 p-4 shadow-sm">
            💡 <strong>Nota del Sistema:</strong> Al reasignar el docente, las calificaciones existentes se preservan y los casilleros de horarios asociados se actualizarán automáticamente.
          </p>
        </div>

        {/* FOOTER BUTTONS GEOMÉTRICOS */}
        <div className="p-5 border-t border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-uecg-line bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-uecg-gray dark:text-zinc-200 shadow-sm disabled:opacity-50 outline-none cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="flex-1 py-3 font-black uppercase tracking-widest text-[11px] bg-uecg-blue text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm outline-none cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UserCheck className="w-3.5 h-3.5" />
            )}
            Confirmar
          </button>
        </div>
      </div>
    </DrawerShell>
  )
}

// Alias for backward compatibility
export const ReassignTeacherModal = ReassignTeacherDrawer
export default ReassignTeacherDrawer
