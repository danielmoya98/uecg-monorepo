import { useState, useEffect, useRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'

export interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder: string
  disabled?: boolean
}

export const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const triggerId = useId()
  const listboxId = useId()

  const selectedOption = options.find((o) => o.value === value)
  const selectedLabel = selectedOption?.label || placeholder

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Foco implícito al listbox al abrir
  useEffect(() => {
    if (isOpen) {
      listboxRef.current?.focus()
    }
  }, [isOpen])

  const handleTriggerClick = () => {
    const nextOpen = !isOpen
    setIsOpen(nextOpen)
    if (nextOpen) {
      const idx = options.findIndex((o) => o.value === value)
      setFocusedIndex(idx >= 0 ? idx : 0)
    } else {
      setFocusedIndex(-1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          const idx = options.findIndex((o) => o.value === value)
          setFocusedIndex(idx >= 0 ? idx : 0)
        } else if (focusedIndex >= 0 && focusedIndex < options.length) {
          onChange(options[focusedIndex].value)
          setIsOpen(false)
          triggerRef.current?.focus()
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          const idx = options.findIndex((o) => o.value === value)
          setFocusedIndex(idx >= 0 ? idx : 0)
        } else {
          setFocusedIndex((prev) => (prev + 1 < options.length ? prev + 1 : 0))
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          const idx = options.findIndex((o) => o.value === value)
          setFocusedIndex(idx >= 0 ? idx : 0)
        } else {
          setFocusedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : options.length - 1))
        }
        break
      case 'Escape':
      case 'Tab':
        if (isOpen) {
          setIsOpen(false)
          triggerRef.current?.focus()
        }
        break
      default:
        break
    }
  }

  // Scroll automático para mantener la opción enfocada a la vista
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const activeEl = listboxRef.current.children[focusedIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [focusedIndex, isOpen])

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        id={triggerId}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between border bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors focus:outline-none focus-visible:border-uecg-blue focus-visible:ring-1 focus-visible:ring-uecg-blue ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-50 border-transparent'
            : 'border-uecg-line hover:border-uecg-blue'
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${
            isOpen ? 'rotate-180 text-uecg-blue' : 'text-uecg-gray'
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          id={listboxId}
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={triggerId}
          onKeyDown={handleKeyDown}
          className="absolute top-full left-0 mt-1 w-full bg-white border border-uecg-line shadow-xl z-[60] max-h-60 overflow-y-auto custom-scrollbar focus:outline-none"
        >
          {options.map((opt, idx) => {
            const isSelected = value === opt.value
            const isFocused = idx === focusedIndex
            return (
              <button
                key={opt.value}
                id={`${listboxId}-option-${idx}`}
                role="option"
                type="button"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                  triggerRef.current?.focus()
                }}
                className={`block w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors focus:outline-none ${
                  isSelected
                    ? 'bg-uecg-blue text-white'
                    : isFocused
                      ? 'bg-gray-100 text-uecg-dark'
                      : 'text-uecg-gray hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
