import { AlertTriangle, Trash2, Loader2, BookMarked } from 'lucide-react'

interface SubjectActionConfirmProps {
  subjectName?: string
  subjectLevel?: string
  onCancel: () => void
  onConfirm: () => void
  isSubmitting: boolean
}

export default function SubjectActionConfirm({
  subjectName,
  subjectLevel,
  onCancel,
  onConfirm,
  isSubmitting,
}: SubjectActionConfirmProps) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="border border-red-200 bg-red-50 p-6 flex flex-col items-center text-center gap-3 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-red-600 animate-bounce" />
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-red-600">
            ADVERTENCIA DE SISTEMA
          </h3>
          <div className="mt-2 flex flex-col items-center justify-center border border-red-200 bg-white px-4 py-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <BookMarked className="w-3.5 h-3.5 text-red-700" />
              <span className="text-xs font-black text-red-900 uppercase tracking-widest">
                {subjectName}
              </span>
            </div>
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest mt-0.5">
              {subjectLevel}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-red-700/80 uppercase tracking-widest leading-relaxed mt-2">
          Si eliminas esta materia, afectará a la carga horaria de los docentes que la dictan actualmente.
          Esta acción no se puede deshacer y alterará los reportes de horario.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-3.5 font-black uppercase tracking-widest text-[10px] border border-uecg-line text-uecg-gray hover:bg-gray-50 transition-colors shadow-sm bg-white disabled:opacity-50 cursor-pointer outline-none focus:ring-2 focus:ring-uecg-blue"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="px-4 py-3.5 font-black uppercase tracking-widest text-[10px] bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer outline-none focus:ring-2 focus:ring-red-600"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          Eliminar Definitivo
        </button>
      </div>
    </div>
  )
}
