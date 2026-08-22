import { useRef, useEffect } from 'react'
import { Search, X, List, LayoutGrid } from 'lucide-react'
import { CustomSelect } from './custom-select'

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
  const inputRef = useRef<HTMLInputElement>(null)

  // Atajo de teclado CTRL+K para enfocar el buscador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const levelOptions = [
    { value: '', label: 'Todos los Niveles' },
    ...allowedLevels.map((lvl) => ({
      value: lvl,
      label: LEVEL_LABELS[lvl] || lvl,
    })),
  ]

  const shiftOptions = [
    { value: '', label: 'Todos los Turnos' },
    ...allowedShifts.map((shf) => ({
      value: shf,
      label: SHIFT_LABELS[shf] || shf,
    })),
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* Buscador y Toggles */}
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-uecg-gray group-focus-within:text-uecg-blue transition-colors" />
          <input
            ref={inputRef}
            type="text"
            placeholder="BUSCAR CURSOS POR GRADO... (CTRL+K)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-full border border-uecg-line bg-white pl-11 pr-10 py-3 text-uecg-text focus:border-uecg-blue focus:outline-none uppercase text-[11px] font-bold tracking-widest placeholder:text-gray-400 transition-colors shadow-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none p-1 cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Botones de Toggle de Vista */}
        <div className="flex border border-uecg-line bg-white shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`px-4 py-3 flex items-center justify-center transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-uecg-dark ${
              viewMode === 'table'
                ? 'bg-uecg-dark text-white shadow-inner'
                : 'text-uecg-gray hover:text-uecg-dark hover:bg-gray-50'
            }`}
            title="Vista de Lista"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`px-4 py-3 flex items-center justify-center transition-colors border-l border-uecg-line cursor-pointer outline-none focus:ring-1 focus:ring-uecg-dark ${
              viewMode === 'grid'
                ? 'bg-uecg-dark text-white shadow-inner border-transparent'
                : 'text-uecg-gray hover:text-uecg-dark hover:bg-gray-50'
            }`}
            title="Vista de Tarjetas"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selectores de Nivel y Turno */}
      <div className="flex flex-col sm:flex-row gap-3 min-w-full sm:min-w-0 sm:w-auto lg:min-w-[420px]">
        <div className="flex-1 sm:w-48">
          <CustomSelect
            value={level}
            onChange={onLevelChange}
            options={levelOptions}
            placeholder="Seleccione Nivel"
          />
        </div>
        <div className="flex-1 sm:w-48">
          <CustomSelect
            value={shift}
            onChange={onShiftChange}
            options={shiftOptions}
            placeholder="Seleccione Turno"
          />
        </div>
      </div>
    </div>
  )
}
export default ClassroomsFilters
