import { UserCog, Plus, Loader2 } from 'lucide-react'
import { PageHeader, PageHeaderButton } from '@/shared/ui/page-header'

interface UsersHeaderProps {
  onOpenCreate: () => void
  isFetching?: boolean
  isPending?: boolean
}

export function UsersHeader({
  onOpenCreate,
  isFetching = false,
  isPending = false,
}: UsersHeaderProps) {
  return (
    <div className="relative w-full">
      {isFetching && !isPending && (
        <div className="absolute top-0 right-0 flex items-center gap-2 text-uecg-blue text-[10px] font-bold uppercase tracking-widest bg-blue-50 px-3 py-1.5 animate-pulse rounded-sm z-20 border border-blue-100 shadow-sm">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Actualizando...
        </div>
      )}

      <PageHeader
        kicker="ADMINISTRACIÓN CENTRAL"
        kickerIcon={UserCog}
        title="Usuarios del Sistema"
        description="Gestión de cuentas, roles de acceso y credenciales de docentes y personal."
      >
        <PageHeaderButton
          id="btn-new-user"
          data-tour="btn-new-user"
          onClick={onOpenCreate}
          icon={Plus}
          variant="dark"
        >
          Nuevo Usuario
        </PageHeaderButton>
      </PageHeader>
    </div>
  )
}
