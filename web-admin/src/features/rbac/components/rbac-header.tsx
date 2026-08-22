import { ShieldAlert, Plus, AlertTriangle, Loader2 } from 'lucide-react'

interface RbacHeaderProps {
  onOpenCreate: () => void
}

export const RbacHeader = ({ onOpenCreate }: RbacHeaderProps) => {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-uecg-line pb-5 mt-2">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-uecg-blue">
          Seguridad y Políticas Globales
        </span>
        <h1 className="text-4xl mt-1.5 font-black tracking-tighter uppercase text-uecg-dark flex items-center gap-3.5">
          <ShieldAlert className="w-9 h-9 text-uecg-blue shrink-0" />
          Gestión de Roles
        </h1>
      </div>

      <button
        type="button"
        onClick={onOpenCreate}
        className="px-5 py-3.5 font-black uppercase tracking-widest text-[10px] bg-uecg-blue text-white hover:bg-uecg-dark hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2.5 shadow-[4px_4px_0px_rgba(0,0,0,0.15)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.3)] outline-none focus:ring-2 focus:ring-uecg-blue focus:ring-offset-2 cursor-pointer"
        aria-label="Crear nuevo perfil de acceso"
      >
        <Plus className="w-4 h-4 stroke-[3px]" /> Nuevo Rol
      </button>
    </header>
  )
}

export const RbacLoader = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-64 flex-col items-center justify-center font-mono text-xs uppercase tracking-[0.2em] text-uecg-dark animate-in fade-in duration-300"
    >
      <Loader2 className="mb-4 h-9 w-9 animate-spin text-uecg-blue" />
      <span>Compilando Matriz de Políticas...</span>
    </div>
  )
}

export const RbacRestrictedAlert = () => {
  return (
    <div
      role="alert"
      className="border-2 border-red-300 bg-red-50/50 p-8 text-left max-w-2xl mt-12 shadow-[6px_6px_0px_0px_rgba(220,38,38,0.15)] animate-in fade-in zoom-in-95 duration-300 mx-auto"
    >
      <AlertTriangle className="w-9 h-9 text-red-600 mb-4" />
      <h2 className="text-xl font-black uppercase tracking-tight text-uecg-dark">
        Acceso Restringido
      </h2>
      <p className="text-[11px] font-bold text-uecg-gray mt-2.5 uppercase tracking-wider leading-relaxed">
        Área de infraestructura crítica de seguridad. No cuentas con credenciales de Super Administrador para alterar
        las políticas de autorización del sistema escolar.
      </p>
    </div>
  )
}
