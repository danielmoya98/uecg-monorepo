import { SwissSearchInput, SwissSelect } from '@/shared/ui'

interface UsersFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filterRole: string
  onRoleChange: (value: string) => void
  viewMode: 'table' | 'grid'
  onViewModeChange: (mode: 'table' | 'grid') => void
}

export default function UsersFilters({
  searchTerm,
  onSearchChange,
  filterRole,
  onRoleChange,
  viewMode,
  onViewModeChange,
}: UsersFiltersProps) {
  const roleOptions = [
    { id: 'Todos', label: 'Todos los Roles' },
    { id: 'SUPER_ADMIN', label: 'Administradores' },
    { id: 'DIRECTOR', label: 'Directores' },
    { id: 'DOCENTE', label: 'Docentes' },
    { id: 'PADRE', label: 'Padres' },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Buscador Suizo con Toggle Table / Grid */}
      <SwissSearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="BUSCAR POR NOMBRE O CORREO EN EL SERVIDOR... (CTRL+K)"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        showViewToggle={true}
      />

      {/* Selector Suizo de Roles */}
      <SwissSelect
        value={filterRole}
        onChange={onRoleChange}
        options={roleOptions}
        placeholder="Todos los Roles"
        className="min-w-[240px]"
      />
    </div>
  )
}
