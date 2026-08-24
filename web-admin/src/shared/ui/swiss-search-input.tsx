import React, { useRef, useEffect } from 'react'
import { Search, X, List, LayoutGrid } from 'lucide-react'

export interface SwissSearchInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  viewMode?: 'table' | 'grid'
  onViewModeChange?: (mode: 'table' | 'grid') => void
  showViewToggle?: boolean
  className?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function SwissSearchInput({
  value,
  onChange,
  placeholder = 'BUSCAR... (CTRL+K)',
  viewMode,
  onViewModeChange,
  showViewToggle = false,
  className = '',
  inputRef: externalRef,
}: SwissSearchInputProps) {
  const localRef = useRef<HTMLInputElement>(null)
  const inputRef = externalRef || localRef

  // Atajo de teclado (CTRL+K / CMD+K) para enfocar búsqueda
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [inputRef])

  return (
    <div className={`flex flex-1 gap-2 ${className}`}>
      {/* Input de Buscador */}
      <div className="relative flex-1 group">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-uecg-gray dark:text-zinc-400 group-focus-within:text-uecg-blue dark:group-focus-within:text-blue-400 transition-colors pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] text-uecg-text dark:text-zinc-100 pl-11 pr-12 py-3 text-[11px] font-bold uppercase tracking-widest placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:border-uecg-blue dark:focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none p-1 transition-colors cursor-pointer"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Toggle opcional de modo de visualización */}
      {showViewToggle && onViewModeChange && viewMode && (
        <div className="flex border border-uecg-line dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`px-4 py-3 flex items-center justify-center transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-uecg-dark text-white dark:bg-zinc-800 dark:text-white shadow-inner'
                : 'text-uecg-gray dark:text-zinc-400 hover:text-uecg-dark dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/50'
            }`}
            title="Vista de Lista"
            aria-label="Vista de Lista"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`px-4 py-3 flex items-center justify-center transition-colors cursor-pointer border-l border-uecg-line dark:border-zinc-800 ${
              viewMode === 'grid'
                ? 'bg-uecg-dark text-white dark:bg-zinc-800 dark:text-white shadow-inner border-transparent'
                : 'text-uecg-gray dark:text-zinc-400 hover:text-uecg-dark dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/50'
            }`}
            title="Vista de Cuadrícula"
            aria-label="Vista de Cuadrícula"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
export default SwissSearchInput
