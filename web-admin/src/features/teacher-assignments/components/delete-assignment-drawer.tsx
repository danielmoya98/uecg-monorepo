import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { DrawerShell } from '@/shared/ui/drawer-shell'
import type { TeacherAssignment } from '../types/teacher-assignments.types'

interface DeleteAssignmentDrawerProps {
  isOpen: boolean
  onClose: () => void
  assignment: TeacherAssignment | null
  onConfirm: (id: string) => void
  isSubmitting: boolean
}

export const DeleteAssignmentDrawer = ({
  isOpen,
  onClose,
  assignment,
  onConfirm,
  isSubmitting,
}: DeleteAssignmentDrawerProps) => {
  const handleDelete = () => {
    if (assignment?.id) {
      onConfirm(assignment.id)
    }
  }

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Asignación"
      kicker="Carga Horaria"
      icon="!"
      headerVariant="danger"
      isSubmitting={isSubmitting}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col h-full">
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-6 flex flex-col items-center text-center gap-3 shadow-sm">
              <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-red-600 dark:text-red-400">
                  ¿QUITAR DOCENTE?
                </h3>
                {assignment && (
                  <div className="mt-3 flex flex-col items-center justify-center border border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-900 px-4 py-3 shadow-sm">
                    <span className="text-xs font-black text-red-900 dark:text-red-200 uppercase tracking-widest leading-none">
                      {assignment.teacher.fullName}
                    </span>
                    <span className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mt-1.5 pt-1.5 border-t border-red-100 dark:border-red-900/40 w-full">
                      de {assignment.subject.name}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-red-700/80 dark:text-red-300 uppercase tracking-widest leading-relaxed mt-2">
                Al quitar a este docente, la materia quedará sin profesor asignado en este curso.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS GEOMÉTRICOS */}
        <div className="p-5 border-t border-uecg-line bg-gray-50 dark:bg-zinc-900 flex gap-3 shrink-0">
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
            onClick={handleDelete}
            disabled={isSubmitting}
            className="flex-1 py-3 font-black uppercase tracking-widest text-[11px] bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm outline-none cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Quitar Docente
          </button>
        </div>
      </div>
    </DrawerShell>
  )
}

export default DeleteAssignmentDrawer
