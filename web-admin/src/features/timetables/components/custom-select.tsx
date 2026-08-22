import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder: string
}

export function CustomSelect({ value, onChange, options, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border bg-white px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest transition-colors shadow-sm cursor-pointer focus:outline-none border-uecg-line hover:border-uecg-blue focus:ring-2 focus:ring-uecg-blue"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${
            isOpen ? 'rotate-180 text-uecg-blue' : 'text-uecg-gray'
          }`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <ul
          className="absolute top-full left-0 mt-1 w-full bg-white border border-uecg-line shadow-2xl z-[150] max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 p-0 list-none"
          role="listbox"
        >
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={value === opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`block w-full text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer border-none outline-none
                  ${
                    value === opt.value
                      ? 'bg-uecg-blue text-white'
                      : 'text-uecg-gray hover:bg-gray-50 hover:text-uecg-dark'
                  }
                `}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
export default CustomSelect
