import { useState, useRef, useEffect } from 'react'
import { Search, X, LayoutGrid, List, Filter, ChevronDown } from 'lucide-react'

interface SwissSelectProps {
  value: string
  onChange: (val: string) => void
  options: { id: string; label: string }[]
  placeholder: string
}

const SwissSelect = ({ value, onChange, options, placeholder }: SwissSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.id === value)
  const displayLabel = selectedOption ? selectedOption.label : placeholder
  const isActive = value !== ''

  return (
    <div className="relative min-w-[200px] flex-1 md:flex-none" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full flex items-center justify-between border bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors shadow-sm focus:outline-none ${
          isActive
            ? 'border-uecg-blue text-uecg-blue bg-blue-50/10'
            : 'border-uecg-line text-uecg-dark hover:border-gray-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <Filter className={`w-3.5 h-3.5 ${isActive ? 'text-uecg-blue' : 'text-uecg-gray'}`} />
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-uecg-blue' : 'text-uecg-gray'
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-uecg-line shadow-xl z-30 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-col max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id)
                  setIsOpen(false)
                }}
                className={`text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  value === opt.id
                    ? 'bg-uecg-blue text-white'
                    : 'text-uecg-gray hover:bg-gray-50 hover:text-uecg-dark'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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
  const inputRef = useRef<HTMLInputElement>(null)

  // ATAJO DE TECLADO (CTRL+K)
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

  const types = [
    { id: '', label: 'TODAS LAS CATEGORÍAS' },
    { id: 'SALON', label: 'SALÓN REGULAR' },
    { id: 'LABORATORIO', label: 'LABORATORIOS' },
    { id: 'CANCHA', label: 'CANCHA / PATIO' },
    { id: 'AUDITORIO', label: 'AUDITORIOS' },
    { id: 'OTRO', label: 'OTROS ESPACIOS' },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-uecg-line shadow-sm">
      {/* BUSCADOR Y TOGGLE JUNTOS */}
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-uecg-gray pointer-events-none group-focus-within:text-uecg-blue transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre... (Ctrl+K)"
            className="w-full h-full border border-uecg-line bg-white pl-10 pr-10 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-uecg-blue focus:ring-1 focus:ring-uecg-blue transition-all"
            aria-label="Buscar espacios físicos"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none p-1 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex border border-uecg-line bg-white shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`px-4 py-3 flex items-center justify-center transition-colors cursor-pointer outline-none ${
              viewMode === 'table'
                ? 'bg-uecg-dark text-white shadow-inner'
                : 'text-uecg-gray hover:text-uecg-dark hover:bg-gray-50'
            }`}
            title="Vista de Lista"
            aria-label="Vista de Lista"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`px-4 py-3 flex items-center justify-center transition-colors border-l border-uecg-line cursor-pointer outline-none ${
              viewMode === 'grid'
                ? 'bg-uecg-dark text-white shadow-inner border-transparent'
                : 'text-uecg-gray hover:text-uecg-dark hover:bg-gray-50'
            }`}
            title="Vista de Cuadrícula"
            aria-label="Vista de Cuadrícula"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <SwissSelect
          value={selectedType}
          onChange={onTypeChange}
          options={types}
          placeholder="Todas las categorías"
        />
      </div>
    </div>
  )
}
