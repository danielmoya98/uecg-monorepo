import { AlertTriangle, Loader2, Trash2, MapPin } from 'lucide-react'
import { DrawerShell } from '@/shared/ui/drawer-shell'
import type { PhysicalSpace } from '../types/physical-spaces.types'

interface DeletePhysicalSpaceDrawerProps {
  isOpen: boolean
  onClose: () => void
  space: PhysicalSpace | null
  onConfirm: (id: string) => void
  isDeleting: boolean
}

export default function DeletePhysicalSpaceDrawer({
  isOpen,
  onClose,
  space,
  onConfirm,
  isDeleting,
}: DeletePhysicalSpaceDrawerProps) {
  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Espacio"
      kicker="Infraestructura"
      icon="!"
      headerVariant="danger"
      isSubmitting={isDeleting}
      maxWidth="max-w-[420px]"
    >
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
        <div className="border border-red-200 bg-red-50 p-6 flex flex-col items-center text-center gap-3 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-600" />
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-red-600">
              ADVERTENCIA DE SISTEMA
            </h3>
            <p className="text-xs font-bold text-red-900 mt-2 uppercase tracking-widest border border-red-200 bg-white px-4 py-2 inline-flex items-center gap-2 shadow-sm">
              <MapPin className="w-3.5 h-3.5" /> {space?.name}
            </p>
          </div>
          <p className="text-[10px] text-red-700/80 uppercase tracking-widest leading-relaxed mt-2">
            Si este espacio ya está asignado a horarios o cursos activos, podría causar conflictos en la
            planificación escolar. Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="bg-gray-50 border border-uecg-line p-4 flex flex-col gap-2">
          <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest">
            Información Técnica:
          </span>
          <span className="text-xs font-bold text-uecg-dark uppercase tracking-widest">
            ID: {space?.id}
          </span>
          <span className="text-xs font-bold text-uecg-dark uppercase tracking-widest">
            Tipo: {space?.type}
          </span>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="mt-auto pt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest border border-uecg-line text-uecg-gray hover:bg-gray-50 shadow-sm disabled:opacity-50 cursor-pointer bg-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => space && onConfirm(space.id)}
            disabled={isDeleting}
            className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 flex justify-center items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Eliminar Definitivo
          </button>
        </div>
      </div>
    </DrawerShell>
  )
}

