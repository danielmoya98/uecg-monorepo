import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SwissSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
  hasError?: boolean;
  id?: string;
}

export default function SwissSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  hasError = false,
  id,
}: SwissSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Soporte para tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;
  const isActive = value !== '';

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative w-full h-[42px]" ref={ref}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={hasError}
        className={`w-full h-full flex items-center justify-between border bg-white px-3 text-xs font-bold uppercase tracking-widest transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-uecg-blue ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-50 border-transparent'
            : 'border-uecg-line hover:border-uecg-blue text-uecg-text cursor-pointer'
        } ${hasError ? 'border-red-500' : isActive ? 'border-uecg-blue text-uecg-blue bg-blue-50/5' : ''}`}
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
          role="listbox"
          aria-label={placeholder}
          className="absolute top-full left-0 mt-1 w-full bg-white border border-uecg-line shadow-2xl z-[60] max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-200"
        >
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer outline-none focus:bg-uecg-blue focus:text-white ${
                  isSelected
                    ? 'bg-uecg-blue text-white'
                    : 'text-uecg-gray hover:bg-gray-50 hover:text-uecg-dark'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
export type { Option };
