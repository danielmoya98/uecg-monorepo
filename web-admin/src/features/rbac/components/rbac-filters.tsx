import { useRef, useEffect } from 'react'
import { Search, X, LayoutGrid, List } from 'lucide-react'

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
  const inputRef = useRef<HTMLInputElement>(null)

  // Atajo de teclado accesible: CTRL+K o CMD+K para enfocar el buscador
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
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Buscador de Roles */}
      <div className="flex flex-1 gap-2.5">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-uecg-gray group-focus-within:text-uecg-blue transition-colors duration-200 pointer-events-none" />
          <input
            ref={inputRef}
            id="rbac-search-input"
            type="text"
            placeholder="BUSCAR ROL POR NOMBRE O DESCRIPCIÓN... (CTRL + K)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-full border border-uecg-line bg-white pl-11 pr-10 py-3.5 text-uecg-text focus:border-uecg-blue focus:ring-1 focus:ring-uecg-blue focus:outline-none uppercase text-[10px] font-black tracking-widest placeholder:text-gray-400/80 transition-all shadow-sm"
            aria-label="Buscar roles por nombre o descripción"
            aria-keyshortcuts="Control+K"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none focus:text-red-500 p-1.5 transition-colors cursor-pointer"
              aria-label="Limpiar criterio de búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toggle de Tipo de Vista (Estilo Suizo Accesible) */}
        <div
          className="flex border border-uecg-line bg-white shadow-sm shrink-0"
          role="group"
          aria-label="Alternar formato de visualización"
        >
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`px-4.5 py-3.5 flex items-center justify-center transition-all duration-200 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-uecg-dark text-white shadow-inner'
                : 'text-uecg-gray hover:text-uecg-dark hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-uecg-blue focus:ring-offset-1`}
            aria-pressed={viewMode === 'table'}
            title="Vista de Lista de Tabla"
          >
            <List className="w-4 h-4" />
            <span className="sr-only">Ver en formato tabla</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`px-4.5 py-3.5 flex items-center justify-center transition-all duration-200 border-l border-uecg-line cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-uecg-dark text-white shadow-inner border-transparent'
                : 'text-uecg-gray hover:text-uecg-dark hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-uecg-blue focus:ring-offset-1`}
            aria-pressed={viewMode === 'grid'}
            title="Vista de Cuadrícula de Tarjetas"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="sr-only">Ver en formato tarjetas</span>
          </button>
        </div>
      </div>
    </div>
  )
}
