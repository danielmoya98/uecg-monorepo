import { ShieldCheck } from 'lucide-react'
import { SwissEmptyState } from '@/shared/ui'
import type { Role } from '../api/rbac.service'
import { RoleCard } from './role-card'
import type { RoleDrawerMode } from './role-drawer'

interface RoleGridProps {
  roles: Role[]
  isPending?: boolean
  onAction: (mode: RoleDrawerMode, role: Role) => void
}

export const RoleGrid = ({ roles, isPending = false, onAction }: RoleGridProps) => {
  if (isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`role-card-sk-${i}`} className="border border-uecg-line bg-white p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-gray-200" />
              <div className="h-6 w-16 bg-gray-100" />
            </div>
            <div className="h-3 w-full bg-gray-100 mt-2" />
            <div className="h-3 w-3/4 bg-gray-100" />
            <div className="flex justify-between items-center pt-4 border-t border-uecg-line mt-auto">
              <div className="h-4 w-20 bg-gray-200" />
              <div className="h-8 w-24 bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

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
