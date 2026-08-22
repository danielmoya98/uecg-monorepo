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
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-uecg-line bg-white">
        <span className="text-sm font-bold text-uecg-gray uppercase tracking-widest">
          No se encontraron roles coincidentes.
        </span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {roles.map((role) => (
        <RoleCard key={role.id} role={role} onAction={onAction} />
      ))}
    </div>
  )
}
