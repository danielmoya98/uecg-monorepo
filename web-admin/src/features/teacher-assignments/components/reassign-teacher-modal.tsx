import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, UserCheck, Loader2, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { TeacherAssignment } from '../types/teacher-assignments.types'

interface Option {
  value: string
  label: string
}

interface ReassignTeacherModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: TeacherAssignment | null
  teachers: any[]
  onConfirm: (payload: { id: string; teacherId: string }) => void
  isSubmitting: boolean
}

export const ReassignTeacherModal = ({
  isOpen,
  onClose,
  assignment,
  teachers,
  onConfirm,
  isSubmitting,
}: ReassignTeacherModalProps) => {
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

  return createPortal(
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={!isSubmitting ? onClose : undefined}
          className="absolute inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg border border-uecg-line bg-white shadow-2xl z-10 overflow-hidden flex flex-col will-change-transform transform-gpu"
        >
          {/* HEADER SUIZO */}
          <div className="flex items-center justify-between border-b border-uecg-line bg-uecg-dark text-white p-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-uecg-blue flex items-center justify-center text-white">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-uecg-line uppercase tracking-widest block">
                  Carga Horaria
                </span>
                <h2 className="text-sm font-black uppercase tracking-tight text-white">
                  Reasignar Titular de Materia
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1 hover:bg-white/10 rounded transition-colors text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CONTENIDO */}
          <div className="p-6 flex flex-col gap-5">
            <div className="border border-uecg-line bg-gray-50 p-4">
              <span className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest block">
                Materia y Curso
              </span>
              <p className="text-sm font-black uppercase tracking-tight text-uecg-dark mt-1">
                {assignment.subject.name}
              </p>
              <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-wider mt-0.5">
                {assignment.classroom.grade} "{assignment.classroom.section}" • {assignment.classroom.level}
              </p>
            </div>

            <div>
              <span className="label-swiss !text-[9px] !mb-1 block">
                Docente Actual:
              </span>
              <p className="text-xs font-black uppercase text-uecg-gray tracking-wider bg-gray-100 p-2.5 border border-uecg-line">
                {assignment.teacher.fullName}
              </p>
            </div>

            <div>
              <label className="label-swiss !text-[9px] !mb-1.5 block">
                Nuevo Docente Titular:
              </label>
              <div className="relative w-full" ref={selectRef}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className="w-full flex items-center justify-between border border-uecg-line bg-white px-3 py-3 text-[10px] font-bold uppercase tracking-widest hover:border-uecg-blue transition-colors shadow-sm focus:outline-none cursor-pointer"
                >
                  <span className="truncate">{selectedTeacherLabel}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isSelectOpen ? 'rotate-180 text-uecg-blue' : 'text-uecg-gray'
                    }`}
                  />
                </button>

                {isSelectOpen && (
                  <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-uecg-line shadow-2xl z-[70] max-h-48 overflow-y-auto custom-scrollbar">
                    {teacherOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedTeacherId(opt.value)
                          setIsSelectOpen(false)
                        }}
                        className={`block w-full text-left px-3 py-2.5 text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                          selectedTeacherId === opt.value
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
            </div>

            <p className="text-[10px] text-uecg-gray font-medium leading-relaxed bg-blue-50 border border-blue-100 p-3 text-blue-900">
              💡 <strong>Nota del Sistema:</strong> Al reasignar el docente, las calificaciones existentes se preservan y los casilleros de horarios asociados se actualizarán automáticamente.
            </p>
          </div>

          {/* FOOTER */}
          <div className="p-4 border-t border-uecg-line bg-gray-50 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest border border-uecg-line text-uecg-gray hover:bg-white shadow-sm disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaveDisabled}
              className="px-5 py-2.5 font-black uppercase tracking-widest text-[10px] bg-uecg-blue text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserCheck className="w-3.5 h-3.5" />
              )}
              Confirmar Reasignación
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}

export default ReassignTeacherModal
