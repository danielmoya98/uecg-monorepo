import { useState, useEffect, useRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder: string
  disabled?: boolean
  hasError?: boolean
}

export const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  hasError = false,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const listboxId = useId()
  const activeOptionId = useId()

  const selectedOption = options.find((o) => o.value === value)
  const selectedLabel = selectedOption?.label || placeholder

  // Cierra el menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sincronizar el focusedIndex con la opción seleccionada al abrir
  useEffect(() => {
    if (isOpen) {
      const selectedIdx = options.findIndex((o) => o.value === value)
      setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0)
    } else {
      setFocusedIndex(-1)
    }
  }, [isOpen, value, options])

  // Scroll automático para mantener el elemento enfocado a la vista
  useEffect(() => {
    if (focusedIndex >= 0 && listboxRef.current) {
      const listElement = listboxRef.current
      const focusedElement = listElement.children[focusedIndex] as HTMLElement
      if (focusedElement) {
        const listHeight = listElement.clientHeight
        const listScrollTop = listElement.scrollTop
        const elementHeight = focusedElement.clientHeight
        const elementOffsetTop = focusedElement.offsetTop

        if (elementOffsetTop < listScrollTop) {
          listElement.scrollTop = elementOffsetTop
        } else if (elementOffsetTop + elementHeight > listScrollTop + listHeight) {
          listElement.scrollTop = elementOffsetTop + elementHeight - listHeight
        }
      }
    }
  }, [focusedIndex, isOpen])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (isOpen) {
          if (focusedIndex >= 0 && focusedIndex < options.length) {
            onChange(options[focusedIndex].value)
            setIsOpen(false)
            triggerRef.current?.focus()
          }
        } else {
          setIsOpen(true)
        }
        break

      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setFocusedIndex((prev) => (prev + 1 < options.length ? prev + 1 : prev))
        }
        break

      case 'ArrowUp':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setFocusedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev))
        }
        break

      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        triggerRef.current?.focus()
        break

      case 'Tab':
        setIsOpen(false)
        break

      case 'Home':
        e.preventDefault()
        if (isOpen) setFocusedIndex(0)
        break

      case 'End':
        e.preventDefault()
        if (isOpen) setFocusedIndex(options.length - 1)
        break

      default:
        break
    }
  }

  const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        onChange(options[index].value)
        setIsOpen(false)
        triggerRef.current?.focus()
        break

      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((prev) => (prev + 1 < options.length ? prev + 1 : prev))
        break

      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev))
        break

      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        triggerRef.current?.focus()
        break

      default:
        break
    }
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between border bg-white px-3 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-uecg-blue/50 ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-50'
            : 'hover:border-uecg-blue'
        } ${hasError ? 'border-red-500' : 'border-uecg-line'}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={isOpen && focusedIndex >= 0 ? `${activeOptionId}-${focusedIndex}` : undefined}
        aria-invalid={hasError}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-uecg-blue' : 'text-uecg-gray'
          }`}
        />
      </button>
      {isOpen && !disabled && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label={placeholder}
          className="absolute top-full left-0 mt-1 w-full bg-white border border-uecg-line shadow-xl z-[60] max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {options.map((opt, idx) => {
            const isSelected = value === opt.value
            const isFocused = idx === focusedIndex

            return (
              <button
                key={opt.value}
                id={`${activeOptionId}-${idx}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                  triggerRef.current?.focus()
                }}
                onKeyDown={(e) => handleOptionKeyDown(e, idx)}
                onMouseEnter={() => setFocusedIndex(idx)}
                className={`block w-full text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer outline-none ${
                  isSelected
                    ? 'bg-uecg-blue text-white'
                    : isFocused
                      ? 'bg-gray-100 text-uecg-dark'
                      : 'text-uecg-gray hover:bg-gray-50 hover:text-uecg-dark focus:bg-gray-100'
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
