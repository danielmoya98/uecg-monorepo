import { useState, useRef, useEffect } from 'react'

import { Filter, ChevronDown, type LucideIcon } from 'lucide-react'

export interface SwissSelectOption {
  id: string
  label: string
}

export interface SwissSelectProps {
  value: string
  onChange: (val: string) => void
  options: SwissSelectOption[]
  placeholder: string
  icon?: LucideIcon
  disabled?: boolean
  className?: string
}

export function SwissSelect({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon = Filter,
  disabled = false,
  className = '',
}: SwissSelectProps) {
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

  // Soporte para tecla Escape en el selector
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const selectedOption = options.find((opt) => opt.id === value)
  const displayLabel = selectedOption ? selectedOption.label : placeholder
  const isActive = value !== 'TODOS' && value !== 'ALL' && value !== ''

  return (
    <div className={`relative min-w-[190px] flex-1 md:flex-none ${className}`} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-full flex items-center justify-between border bg-white dark:bg-[#121214] px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors shadow-sm focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isActive
            ? 'border-uecg-blue text-uecg-blue bg-blue-50/10 dark:bg-blue-950/20 dark:border-blue-500 dark:text-blue-400'
            : 'border-uecg-line dark:border-zinc-800 text-uecg-text dark:text-zinc-200 hover:border-gray-400 dark:hover:border-zinc-600'
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-uecg-blue dark:text-blue-400' : 'text-uecg-gray dark:text-zinc-500'}`} />
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-uecg-blue dark:text-blue-400' : 'text-uecg-gray dark:text-zinc-500'
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-[#121214] border border-uecg-line dark:border-zinc-800 shadow-xl z-40 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="flex flex-col max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={value === opt.id}
                onClick={() => {
                  onChange(opt.id)
                  setIsOpen(false)
                }}
                className={`text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                  value === opt.id
                    ? 'bg-uecg-blue text-white dark:bg-blue-600'
                    : 'text-uecg-gray dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/60 hover:text-uecg-dark dark:hover:text-white'
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
export default SwissSelect
