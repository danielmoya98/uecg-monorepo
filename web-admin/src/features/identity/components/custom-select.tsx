import { useState, useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Option } from '../types/identity.types'

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
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder

  const handleToggle = () => {
    if (disabled) return
    const nextOpen = !isOpen
    setIsOpen(nextOpen)
    if (nextOpen) {
      const selectedIndex = options.findIndex((o) => o.value === value)
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    } else {
      setFocusedIndex(-1)
    }
  }

  // Manejo de teclado (WCAG 2.1 AA)
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (disabled) return

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        const selectedIndex = options.findIndex((o) => o.value === value)
        setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0)
        return
      }

      const direction = e.key === 'ArrowDown' ? 1 : -1
      let nextIndex = focusedIndex + direction
      if (nextIndex < 0) nextIndex = options.length - 1
      if (nextIndex >= options.length) nextIndex = 0
      setFocusedIndex(nextIndex)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        const selectedIndex = options.findIndex((o) => o.value === value)
        setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0)
      } else if (focusedIndex >= 0 && focusedIndex < options.length) {
        onChange(options[focusedIndex].value)
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      buttonRef.current?.focus()
    } else if (e.key === 'Tab' && isOpen) {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative w-full" ref={ref} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className={`w-full flex items-center justify-between border bg-white px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-uecg-blue ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-50 border-transparent'
            : 'border-uecg-line hover:border-uecg-blue text-uecg-text cursor-pointer'
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-uecg-blue' : 'text-uecg-gray'
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            aria-label={placeholder}
            className="absolute top-full left-0 mt-1 w-full bg-white border border-uecg-line shadow-2xl z-[60] max-h-60 overflow-y-auto custom-scrollbar"
          >
            {options.map((opt, index) => {
              const isSelected = value === opt.value
              const isFocused = index === focusedIndex

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                    buttonRef.current?.focus()
                  }}
                  className={`block w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors outline-none cursor-pointer ${
                    isSelected
                      ? 'bg-uecg-blue text-white'
                      : isFocused
                        ? 'bg-gray-100 text-uecg-dark font-black'
                        : 'text-uecg-gray hover:bg-gray-50 hover:text-uecg-dark'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default CustomSelect
