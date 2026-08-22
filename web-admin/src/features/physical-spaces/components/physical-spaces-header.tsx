import { Plus, MapPin } from 'lucide-react'

interface PhysicalSpacesHeaderProps {
  canManageSpaces: boolean
  onOpenCreate: () => void
}

export function PhysicalSpacesHeader({
  canManageSpaces,
  onOpenCreate,
}: PhysicalSpacesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-uecg-line pb-6 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center shadow-md bg-uecg-blue text-white font-black text-xl">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-black text-uecg-gray uppercase tracking-widest leading-none block">
            Infraestructura
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-uecg-dark mt-1">
            Espacios Físicos
          </h1>
        </div>
      </div>

      {canManageSpaces && (
        <button
          type="button"
          onClick={onOpenCreate}
          className="px-6 py-3.5 bg-uecg-blue text-white font-black text-xs uppercase tracking-widest hover:bg-uecg-dark transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer outline-none self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Registrar Espacio
        </button>
      )}
    </div>
  )
}
