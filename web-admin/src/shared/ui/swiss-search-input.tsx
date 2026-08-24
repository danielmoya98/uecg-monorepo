import React, { useRef, useEffect } from 'react'
import { Search, X, List, LayoutGrid } from 'lucide-react'
import { SwissKbd } from './swiss-kbd'

export interface SwissSearchInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  hotkeyHint?: string
  viewMode?: 'table' | 'grid'
  onViewModeChange?: (mode: 'table' | 'grid') => void
  showViewToggle?: boolean
  className?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function SwissSearchInput({
  value,
  onChange,
  placeholder = 'BUSCAR ESTUDIANTE...',
  hotkeyHint = '⌘K',
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
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-uecg-gray group-focus-within:text-uecg-blue transition-colors pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full border border-uecg-line bg-white dark:bg-zinc-900 dark:border-zinc-700 pl-11 pr-16 py-3 text-uecg-text dark:text-zinc-100 focus:border-uecg-blue focus:outline-none uppercase text-[11px] font-bold tracking-widest placeholder:text-gray-400 dark:placeholder:text-zinc-500 transition-colors shadow-sm"
        />

        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none p-1 transition-colors cursor-pointer"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        ) : hotkeyHint ? (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
            <SwissKbd className="opacity-70">{hotkeyHint}</SwissKbd>
          </div>
        ) : null}
      </div>

      {/* Toggle opcional de modo de visualización */}
      {showViewToggle && onViewModeChange && viewMode && (
        <div className="flex border border-uecg-line dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`px-4 py-3 flex items-center justify-center transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-uecg-dark text-white shadow-inner dark:bg-zinc-800'
                : 'text-uecg-gray hover:text-uecg-dark hover:bg-gray-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
            }`}
            title="Vista de Lista"
            aria-label="Vista de Lista"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`px-4 py-3 flex items-center justify-center transition-colors cursor-pointer border-l border-uecg-line dark:border-zinc-700 ${
              viewMode === 'grid'
                ? 'bg-uecg-dark text-white shadow-inner border-transparent dark:bg-zinc-800'
                : 'text-uecg-gray hover:text-uecg-dark hover:bg-gray-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
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
