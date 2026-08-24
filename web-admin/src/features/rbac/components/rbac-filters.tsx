import { SwissSearchInput } from '@/shared/ui'

interface RbacFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  viewMode: 'table' | 'grid'
  onViewModeChange: (mode: 'table' | 'grid') => void
}

export default function RbacFilters({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: RbacFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Buscador Suizo con Toggle Table / Grid */}
      <SwissSearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="BUSCAR ROL POR NOMBRE O DESCRIPCIÓN... (CTRL+K)"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        showViewToggle={true}
      />
    </div>
  )
}
