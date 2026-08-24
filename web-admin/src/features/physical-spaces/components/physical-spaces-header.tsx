import { Plus, MapPin } from 'lucide-react'
import { PageHeader, PageHeaderButton } from '@/shared/ui/page-header'

interface PhysicalSpacesHeaderProps {
  canManageSpaces: boolean
  onOpenCreate: () => void
}

export function PhysicalSpacesHeader({
  canManageSpaces,
  onOpenCreate,
}: PhysicalSpacesHeaderProps) {
  return (
    <PageHeader
      kicker="INFRAESTRUCTURA"
      kickerIcon={MapPin}
      title="Espacios Físicos"
      description="Gestión de aulas, laboratorios, canchas y ambientes escolares."
    >
      {canManageSpaces && (
        <PageHeaderButton
          id="btn-new-space"
          data-tour="btn-new-space"
          onClick={onOpenCreate}
          icon={Plus}
          variant="dark"
        >
          Registrar Espacio
        </PageHeaderButton>
      )}
    </PageHeader>
  )
}

