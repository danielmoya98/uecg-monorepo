import { useRef, useEffect } from 'react'
import { Search, X, LayoutGrid, List } from 'lucide-react'
import SwissSelect from './swiss-select'

const LEVEL_LABELS: Record<string, string> = {
  INICIAL: 'Inicial',
  PRIMARIA: 'Primaria',
  SECUNDARIA: 'Secundaria',
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los Estados' },
  { value: 'active', label: 'Solo Activas' },
  { value: 'inactive', label: 'Solo Inactivas' },
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
  const inputRef = useRef<HTMLInputElement>(null)

  // Atajo de teclado global (CTRL+K o META+K) para enfocar buscador
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

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Caja de Buscador y Botones de Vista */}
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-uecg-gray group-focus-within:text-uecg-blue transition-colors" />
          <input
            ref={inputRef}
            type="text"
            placeholder="BUSCAR MATERIA POR NOMBRE, SIGLA O ÁREA... (CTRL+K)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-full border border-uecg-line bg-white pl-11 pr-12 py-3.5 text-uecg-text focus:border-uecg-blue focus:outline-none focus:ring-2 focus:ring-uecg-blue uppercase text-[11px] font-bold tracking-widest placeholder:text-gray-400 transition-colors shadow-sm"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-gray-400 hover:text-red-500 focus:outline-none p-1.5 cursor-pointer rounded-full"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Interruptor de vistas (Tabla / Grid) */}
        <div className="flex border border-uecg-line bg-white shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`px-4 py-3 flex items-center justify-center transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-uecg-blue ${
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
            className={`px-4 py-3 flex items-center justify-center transition-colors border-l border-uecg-line cursor-pointer outline-none focus:ring-2 focus:ring-uecg-blue ${
              viewMode === 'grid'
                ? 'bg-uecg-dark text-white shadow-inner border-transparent'
                : 'text-uecg-gray hover:text-uecg-dark hover:bg-gray-50'
            }`}
            title="Vista de Cuadrícula"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selectores de Nivel y Estado Suiza */}
      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        <SwissSelect
          value={selectedLevel}
          onChange={onLevelChange}
          options={allowedLevels.map((lvl) => ({
            value: lvl,
            label: LEVEL_LABELS[lvl] || lvl,
          }))}
          placeholder="Todos los Niveles"
          showFilterIcon
        />

        <SwissSelect
          value={selectedStatus}
          onChange={onStatusChange}
          options={STATUS_OPTIONS}
          placeholder="Todos los Estados"
          showFilterIcon
        />
      </div>
    </div>
  )
}

