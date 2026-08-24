import { SwissSearchInput, SwissSelect } from '@/shared/ui'

const LEVEL_LABELS: Record<string, string> = {
  INICIAL: 'Inicial',
  PRIMARIA: 'Primaria',
  SECUNDARIA: 'Secundaria',
}

const STATUS_OPTIONS = [
  { id: 'all', label: 'Todos los Estados' },
  { id: 'active', label: 'Solo Activas' },
  { id: 'inactive', label: 'Solo Inactivas' },
]

interface SubjectsFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedLevel: string
  onLevelChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
  allowedLevels: string[]
  viewMode: 'table' | 'grid'
  onViewModeChange: (mode: 'table' | 'grid') => void
}

export default function SubjectsFilters({
  searchTerm,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  selectedStatus,
  onStatusChange,
  allowedLevels,
  viewMode,
  onViewModeChange,
}: SubjectsFiltersProps) {
  const levelOptions = [
    { id: '', label: 'Todos los Niveles' },
    ...allowedLevels.map((lvl) => ({
      id: lvl,
      label: LEVEL_LABELS[lvl] || lvl,
    })),
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Buscador Suizo con Toggle Table / Grid */}
      <SwissSearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="BUSCAR MATERIA POR NOMBRE, SIGLA O ÁREA... (CTRL+K)"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        showViewToggle={true}
      />

      {/* Selectores de Nivel y Estado Suizo */}
      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        <SwissSelect
          value={selectedLevel}
          onChange={onLevelChange}
          options={levelOptions}
          placeholder="Todos los Niveles"
        />

        <SwissSelect
          value={selectedStatus}
          onChange={onStatusChange}
          options={STATUS_OPTIONS}
          placeholder="Todos los Estados"
        />
      </div>
    </div>
  )
}
