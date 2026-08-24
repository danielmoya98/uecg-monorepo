import { SwissSearchInput, SwissSelect } from '@/shared/ui'

interface PhysicalSpacesFiltersProps {
  searchTerm: string
  onSearchChange: (search: string) => void
  selectedType: string
  onTypeChange: (type: string) => void
  viewMode: 'table' | 'grid'
  onViewModeChange: (mode: 'table' | 'grid') => void
}

export default function PhysicalSpacesFilters({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  viewMode,
  onViewModeChange,
}: PhysicalSpacesFiltersProps) {
  const types = [
    { id: '', label: 'TODAS LAS CATEGORÍAS' },
    { id: 'SALON', label: 'SALÓN REGULAR' },
    { id: 'LABORATORIO', label: 'LABORATORIOS' },
    { id: 'CANCHA', label: 'CANCHA / PATIO' },
    { id: 'AUDITORIO', label: 'AUDITORIOS' },
    { id: 'OTRO', label: 'OTROS ESPACIOS' },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Buscador Suizo con Toggle Table / Grid */}
      <SwissSearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="BUSCAR ESPACIO POR NOMBRE... (CTRL+K)"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        showViewToggle={true}
      />

      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <SwissSelect
          value={selectedType}
          onChange={onTypeChange}
          options={types}
          placeholder="Todas las categorías"
          className="min-w-[220px]"
        />
      </div>
    </div>
  )
}
