import { useState, useEffect, useRef } from 'react'
import { Save, Loader2, CalendarRange, Lock, Unlock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { DrawerShell } from '@/shared/ui/drawer-shell'
import { useTrimestersData } from '../hooks/use-trimesters-data'
import type { AcademicYearData, Trimester } from '../types/academic-years.types'


interface TrimesterCardProps {
  trimester: Trimester
  onUpdate: (
    id: string,
    payload: { startDate?: string; endDate?: string; isOpen?: boolean }
  ) => void
  isUpdating: boolean
}

const TrimesterCard = ({ trimester, onUpdate, isUpdating }: TrimesterCardProps) => {
  const [startDate, setStartDate] = useState(trimester.startDate.substring(0, 10))
  const [endDate, setEndDate] = useState(trimester.endDate.substring(0, 10))
  const [isOpen, setIsOpen] = useState(trimester.isOpen)

  // Sincronizar estado local cuando se actualice la lista de trimestres
  useEffect(() => {
    setStartDate(trimester.startDate.substring(0, 10))
    setEndDate(trimester.endDate.substring(0, 10))
    setIsOpen(trimester.isOpen)
  }, [trimester.startDate, trimester.endDate, trimester.isOpen])

  const formatName = (name: string) =>
    name
      .replace('_', ' ')
      .replace('PRIMER', '1ER')
      .replace('SEGUNDO', '2DO')
      .replace('TERCER', '3ER')

  const handleSave = () => {
    if (startDate >= endDate) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin.')
      return
    }

    onUpdate(trimester.id, {
      startDate: `${startDate}T00:00:00.000Z`,
      endDate: `${endDate}T00:00:00.000Z`,
      isOpen,
    })
  }

  return (
    <div
      className={`p-4 border transition-colors ${
        isOpen ? 'border-green-400 bg-green-50/30' : 'border-uecg-line bg-gray-50'
      }`}
    >
      <div className="flex justify-between items-center mb-3 border-b border-uecg-line pb-2">
        <h4 className="text-xs font-black uppercase tracking-widest text-uecg-text flex items-center gap-2">
          {isOpen ? (
            <Unlock className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-uecg-gray" />
          )}
          {formatName(trimester.name)}
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`start-date-${trimester.id}`}
            className="text-[9px] font-black uppercase tracking-widest text-uecg-gray"
          >
            Inicio
          </label>
          <input
            id={`start-date-${trimester.id}`}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-uecg-line bg-white px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-uecg-blue"
            disabled={isUpdating}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`end-date-${trimester.id}`}
            className="text-[9px] font-black uppercase tracking-widest text-uecg-gray"
          >
            Fin
          </label>
          <input
            id={`end-date-${trimester.id}`}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-uecg-line bg-white px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-uecg-blue"
            disabled={isUpdating}
          />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <label
          htmlFor={`system-open-${trimester.id}`}
          className="flex items-center gap-2 cursor-pointer"
        >
          <input
            id={`system-open-${trimester.id}`}
            type="checkbox"
            checked={isOpen}
            onChange={(e) => setIsOpen(e.target.checked)}
            className="w-4 h-4 text-uecg-blue focus:ring-uecg-blue border-gray-300 rounded-sm"
            disabled={isUpdating}
          />
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${
              isOpen ? 'text-green-600 font-bold' : 'text-uecg-gray'
            }`}
          >
            {isOpen ? 'SISTEMA ABIERTO' : 'SISTEMA CERRADO'}
          </span>
        </label>
        <button
          type="button"
          onClick={handleSave}
          disabled={isUpdating}
          className="px-3 py-1.5 bg-uecg-dark text-white text-[9px] font-black uppercase tracking-widest hover:bg-uecg-blue transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer outline-none"
        >
          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Guardar
        </button>
      </div>
    </div>
  )
}

interface TrimestersDrawerProps {
  isOpen: boolean
  onClose: () => void
  academicYear: AcademicYearData | null
}

export default function TrimestersDrawer({ isOpen, onClose, academicYear }: TrimestersDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  // Consumimos el hook modular de trimestres
  const { trimestersList, isLoading, updateTrimester, isUpdating } = useTrimestersData(
    academicYear?.id,
    isOpen
  )

  // Accesibilidad: Focus Trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isUpdating) onClose()
      }
      if (e.key === 'Tab') {
        if (!drawerRef.current) return
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousFocus = document.activeElement as HTMLElement

    // Enfocar primer elemento interactivo
    setTimeout(() => {
      const firstInput = drawerRef.current?.querySelector('button:not([disabled])') as HTMLElement
      firstInput?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [isOpen, onClose, isUpdating])

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title={`Trimestres ${academicYear?.year || ''}`}
      kicker="Calendario Escolar"
      icon={<CalendarRange className="w-5 h-5 text-white" />}
      headerVariant="dark"
      isSubmitting={isUpdating}
      maxWidth="max-w-[440px]"
    >
      {/* Contenido */}
      <div className="p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
        <div className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed bg-blue-50/50 border border-blue-200 p-3 flex flex-col gap-1 dark:bg-blue-950/20 dark:border-blue-900/40">
          <span className="text-uecg-blue dark:text-blue-400 font-black flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Regla de Exclusividad de Periodos
          </span>
          <p>
            Solo puede existir <strong>un único trimestre abierto a la vez</strong>. Al activar la casilla de un trimestre, el sistema cerrará automáticamente los demás de forma atómica.
          </p>
        </div>
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-uecg-blue" />
          </div>
        ) : trimestersList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-uecg-line bg-gray-50 mt-4">
            <div className="w-12 h-12 border-4 border-gray-200 rotate-45 mb-6 flex items-center justify-center"></div>
            <p className="text-[11px] font-black uppercase tracking-widest text-uecg-gray">
              Sin Trimestres Registrados
            </p>
          </div>
        ) : (
          trimestersList.map((t) => (
            <TrimesterCard
              key={t.id}
              trimester={t}
              onUpdate={(trimesterId, payload) =>
                updateTrimester({ id: trimesterId, payload })
              }
              isUpdating={isUpdating}
            />
          ))
        )}
      </div>
    </DrawerShell>
  )
}

