import { ShieldAlert, Plus, AlertTriangle, Loader2 } from 'lucide-react'
import { PageHeader, PageHeaderButton } from '@/shared/ui/page-header'

interface RbacHeaderProps {
  onOpenCreate: () => void
}

export const RbacHeader = ({ onOpenCreate }: RbacHeaderProps) => {
  return (
    <PageHeader
      kicker="SEGURIDAD Y POLÍTICAS GLOBALES"
      kickerIcon={ShieldAlert}
      title="Gestión de Roles"
      description="Control de acceso basado en atributos (ABAC) y permisos de seguridad del sistema."
    >
      <PageHeaderButton
        id="btn-new-role"
        data-tour="btn-new-role"
        onClick={onOpenCreate}
        icon={Plus}
        variant="dark"
      >
        Nuevo Rol
      </PageHeaderButton>
    </PageHeader>
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
