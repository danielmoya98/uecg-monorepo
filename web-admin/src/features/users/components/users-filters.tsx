import { useState, useRef, useEffect } from 'react'
import { Search, X, ChevronDown, Filter, LayoutGrid, List } from 'lucide-react'

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const roleOptions = [
    { value: 'Todos', label: 'Todos los Roles' },
    { value: 'SUPER_ADMIN', label: 'Administradores' },
    { value: 'DIRECTOR', label: 'Directores' },
    { value: 'DOCENTE', label: 'Docentes' },
    { value: 'PADRE', label: 'Padres' },
  ]

  // Cierra el menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const selectedLabel = roleOptions.find((opt) => opt.value === filterRole)?.label || 'Todos los Roles'
  const isActiveFilter = filterRole !== 'Todos'

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* BUSCADOR Y TOGGLE JUNTOS */}
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-uecg-gray group-focus-within:text-uecg-blue transition-colors" />
          <input
            ref={inputRef}
            type="text"
            placeholder="BUSCAR POR NOMBRE O CORREO EN EL SERVIDOR... (CTRL+K)"
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

        {/* BOTÓN TOGGLE */}
        <div className="flex border border-uecg-line bg-white shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`px-4 py-3 flex items-center justify-center transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-uecg-dark ${viewMode === 'table'
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
            className={`px-4 py-3 flex items-center justify-center transition-colors border-l border-uecg-line cursor-pointer outline-none focus:ring-1 focus:ring-uecg-dark ${viewMode === 'grid'
              ? 'bg-uecg-dark text-white shadow-inner border-transparent'
              : 'text-uecg-gray hover:text-uecg-dark hover:bg-gray-50'
              }`}
            title="Vista de Cuadrícula"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* COMBOBOX PERSONALIZADO */}
      <div className="relative min-w-[240px]" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full h-full flex items-center justify-between border bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors shadow-sm focus:outline-none cursor-pointer ${isActiveFilter
            ? 'border-uecg-blue text-uecg-blue bg-blue-50/10'
            : 'border-uecg-line text-uecg-text hover:border-gray-400'
            }`}
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
        >
          <div className="flex items-center gap-2">
            <Filter className={`w-3.5 h-3.5 ${isActiveFilter ? 'text-uecg-blue' : 'text-uecg-gray'}`} />
            {selectedLabel}
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-uecg-blue' : 'text-uecg-gray'
              }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-uecg-line shadow-xl z-30 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex flex-col" role="listbox">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onRoleChange(option.value)
                    setIsDropdownOpen(false)
                  }}
                  className={`text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer outline-none ${filterRole === option.value
                    ? 'bg-uecg-blue text-white'
                    : 'text-uecg-gray hover:bg-gray-50 hover:text-uecg-dark focus:bg-gray-100 focus:text-uecg-dark'
                    }`}
                  role="option"
                  aria-selected={filterRole === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
