import { ShieldCheck } from 'lucide-react'
import { SwissEmptyState } from '@/shared/ui'
import type { Role } from '../api/rbac.service'
import { RoleCard } from './role-card'
import type { RoleDrawerMode } from './role-drawer'

interface RoleGridProps {
  roles: Role[]
  onAction: (mode: RoleDrawerMode, role: Role) => void
}

export const RoleGrid = ({ roles, onAction }: RoleGridProps) => {
  if (roles.length === 0) {
    return (
      <div className="border border-uecg-line bg-white shadow-sm">
        <SwissEmptyState
          icon={ShieldCheck}
          title="Sin Roles Encontrados"
          description="No se encontraron roles coincidentes en el sistema."
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-16">
      {roles.map((role) => (
        <RoleCard key={role.id} role={role} onAction={onAction} />
      ))}
    </div>
  )
}
export default RoleGrid
