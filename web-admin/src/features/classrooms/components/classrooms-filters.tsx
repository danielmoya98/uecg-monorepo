import { SwissSearchInput, SwissSelect } from '@/shared/ui'

interface ClassroomsFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  level: string
  onLevelChange: (value: string) => void
  shift: string
  onShiftChange: (value: string) => void
  allowedLevels: string[]
  allowedShifts: string[]
  viewMode: 'table' | 'grid'
  onViewModeChange: (mode: 'table' | 'grid') => void
}

const LEVEL_LABELS: Record<string, string> = {
  INICIAL: 'Nivel Inicial',
  PRIMARIA: 'Nivel Primaria',
  SECUNDARIA: 'Nivel Secundaria',
}

const SHIFT_LABELS: Record<string, string> = {
  MANANA: 'Turno Mañana',
  TARDE: 'Turno Tarde',
  NOCHE: 'Turno Noche',
}

export const ClassroomsFilters = ({
  searchTerm,
  onSearchChange,
  level,
  onLevelChange,
  shift,
  onShiftChange,
  allowedLevels,
  allowedShifts,
  viewMode,
  onViewModeChange,
}: ClassroomsFiltersProps) => {
  const levelOptions = [
    { id: '', label: 'Todos los Niveles' },
    ...allowedLevels.map((lvl) => ({
      id: lvl,
      label: LEVEL_LABELS[lvl] || lvl,
    })),
  ]

  const shiftOptions = [
    { id: '', label: 'Todos los Turnos' },
    ...allowedShifts.map((shf) => ({
      id: shf,
      label: SHIFT_LABELS[shf] || shf,
    })),
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* Buscador Suizo con Toggle Table / Grid */}
      <SwissSearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="BUSCAR CURSOS POR GRADO... (CTRL+K)"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        showViewToggle={true}
      />

      {/* Selectores de Nivel y Turno */}
      <div className="flex flex-col sm:flex-row gap-3 min-w-full sm:min-w-0 sm:w-auto lg:min-w-[420px]">
        <SwissSelect
          value={level}
          onChange={onLevelChange}
          options={levelOptions}
          placeholder="Todos los Niveles"
          className="flex-1"
        />
        <SwissSelect
          value={shift}
          onChange={onShiftChange}
          options={shiftOptions}
          placeholder="Todos los Turnos"
          className="flex-1"
        />
      </div>
    </div>
  )
}
export default ClassroomsFilters
