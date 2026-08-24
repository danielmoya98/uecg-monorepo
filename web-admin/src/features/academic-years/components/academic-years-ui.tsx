import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  CalendarCheck,
  CalendarDays,
  CalendarX,
  Plus,
  Loader2,
  MoreVertical,
  Edit,
  Settings2,
  Power,
  PowerOff,
  RefreshCcw,
  Trash2,
} from 'lucide-react'

import { SwissSearchInput, SwissTableContainer, SwissEmptyState } from '@/shared/ui'
import type { AcademicYearData } from '../types/academic-years.types'
import { PageHeader, PageHeaderButton } from '@/shared/ui/page-header'


export interface AcademicYearsHeaderProps {
  onOpenCreate: () => void
}

export const AcademicYearsHeader = ({ onOpenCreate }: AcademicYearsHeaderProps) => (
  <PageHeader
    kicker="ESTRUCTURA ACADÉMICA"
    kickerIcon={Calendar}
    title="Años Lectivos"
    description="Configuración y administración de gestiones escolares y periodos trimestrales."
  >
    <PageHeaderButton
      id="btn-new-academic-year"
      data-tour="btn-new-academic-year"
      onClick={onOpenCreate}
      icon={Plus}
      variant="dark"
    >
      Nueva Gestión
    </PageHeaderButton>
  </PageHeader>
)


export interface AcademicYearsToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onResetPage: () => void
}

export const AcademicYearsToolbar = ({
  searchTerm,
  onSearchChange,
  onResetPage,
}: AcademicYearsToolbarProps) => (
  <div className="w-full md:w-1/2">
    <SwissSearchInput
      value={searchTerm}
      onChange={(val) => {
        onSearchChange(val)
        onResetPage()
      }}
      placeholder="BUSCAR GESTIÓN... (CTRL+K)"
    />
  </div>
)


const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="text-[9px] font-black uppercase tracking-widest bg-uecg-blue text-white px-2 py-1 flex items-center gap-1.5 w-fit">
          <CalendarCheck className="w-3 h-3" /> Activa
        </span>
      )
    case 'PLANNING':
      return (
        <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-700 px-2 py-1 flex items-center gap-1.5 w-fit">
          <CalendarDays className="w-3 h-3" /> Planificación
        </span>
      )
    case 'CLOSED':
      return (
        <span className="text-[9px] font-black uppercase tracking-widest bg-gray-200 text-gray-600 px-2 py-1 flex items-center gap-1.5 w-fit">
          <CalendarX className="w-3 h-3" /> Cerrada
        </span>
      )
    default:
      return null
  }
}

const TableRowSkeleton = () => (
  <tr className="border-b border-uecg-line animate-pulse h-16 bg-white">
    <td className="px-6 py-3 border-r border-uecg-line">
      <div className="h-4 bg-gray-200 dark:bg-zinc-800 w-1/2"></div>
      <div className="h-3 bg-gray-100 dark:bg-zinc-900 w-1/4 mt-2"></div>
    </td>
    <td className="px-6 py-3 border-r border-uecg-line">
      <div className="h-4 bg-gray-200 dark:bg-zinc-800 w-1/2"></div>
    </td>
    <td className="px-6 py-3 border-r border-uecg-line">
      <div className="h-5 bg-gray-200 dark:bg-zinc-800 w-20"></div>
    </td>
    <td className="px-6 py-3 text-center">
      <div className="h-8 bg-gray-100 dark:bg-zinc-900 w-8 mx-auto"></div>
    </td>
  </tr>
)

export interface AcademicYearsTableProps {
  years: AcademicYearData[]
  isLoadingData: boolean
  onEdit: (year: AcademicYearData) => void
  onOpenTrimesters: (year: AcademicYearData) => void
  onDelete: (year: AcademicYearData) => void
  onStatusChange: (id: string, status: 'ACTIVE' | 'CLOSED') => void
  isUpdatingStatus: boolean
  updatingId?: string
}

export const AcademicYearsTable = ({
  years,
  isLoadingData,
  onEdit,
  onOpenTrimesters,
  onDelete,
  onStatusChange,
  isUpdatingStatus,
  updatingId,
}: AcademicYearsTableProps) => {
  const [dropdownState, setDropdownState] = useState<{ id: string; coords: { top: number; left: number } } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownState(null)
      }
    }
    if (dropdownState) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownState])

  useEffect(() => {
    const handleScroll = () => setDropdownState(null)
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownState(null)
      }
    }
    if (dropdownState) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [dropdownState])

  const handleOpenDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (dropdownState?.id === id) {
      setDropdownState(null)
      return
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDropdownState({
      id,
      coords: {
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX - 176,
      },
    })
  }

  return (

    <>
      <SwissTableContainer isPending={isLoadingData}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-uecg-line dark:border-zinc-800">
              <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">Gestión</th>
              <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">Periodo (Inicio - Fin)</th>
              <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">Estado</th>
              <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 text-center w-24">Acción</th>
            </tr>
          </thead>
          <motion.tbody layout>
            {isLoadingData ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))
            ) : years.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-0">
                  <SwissEmptyState
                    title="No se encontraron gestiones"
                    description="No hay años lectivos registrados para el criterio de búsqueda."
                  />
                </td>
              </tr>
            ) : (
              years.map((y: AcademicYearData) => (
                <motion.tr
                  layout
                  key={y.id}
                  className="border-b border-uecg-line dark:border-zinc-800 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors bg-white dark:bg-[#121214] h-16"
                >
                  <td className="px-6 py-3 border-r border-uecg-line dark:border-zinc-800">
                    <p className="font-black uppercase tracking-tight text-uecg-text dark:text-zinc-100 text-sm leading-none">{y.name}</p>
                    <p className="text-[10px] text-uecg-gray dark:text-zinc-400 font-bold mt-1.5 tracking-widest leading-none">AÑO: {y.year}</p>
                  </td>
                  <td className="px-6 py-3 border-r border-uecg-line dark:border-zinc-800 font-mono text-xs font-bold text-uecg-gray dark:text-zinc-300 tracking-widest">
                    {y.startDate.substring(0, 10)} <span className="text-uecg-blue dark:text-blue-400 mx-2 font-sans">→</span> {y.endDate.substring(0, 10)}
                  </td>
                  <td className="px-6 py-3 border-r border-uecg-line dark:border-zinc-800">
                    <StatusBadge status={y.status} />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      id={`dropdown-trigger-${y.id}`}
                      type="button"
                      onClick={(e) => handleOpenDropdown(e, y.id)}
                      className={`text-uecg-gray dark:text-zinc-400 hover:text-uecg-blue dark:hover:text-blue-400 p-2 focus:outline-none cursor-pointer transition-colors ${dropdownState?.id === y.id ? 'text-uecg-blue bg-gray-50 dark:bg-zinc-800' : ''}`}
                      disabled={isUpdatingStatus}
                      aria-haspopup="menu"
                      aria-expanded={dropdownState?.id === y.id}
                      aria-label={`Opciones de gestión para ${y.name}`}
                    >
                      {isUpdatingStatus && updatingId === y.id ? (
                        <Loader2 className="w-4 h-4 mx-auto animate-spin" />
                      ) : (
                        <MoreVertical className="w-4 h-4 mx-auto" />
                      )}
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </table>
      </SwissTableContainer>

      {dropdownState && createPortal(
        <motion.div
          ref={dropdownRef}
          role="menu"
          aria-labelledby={`dropdown-trigger-${dropdownState.id}`}
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: `${dropdownState.coords.top}px`,
            left: `${dropdownState.coords.left}px`,
          }}
          className="w-52 bg-white dark:bg-[#121214] border border-uecg-line dark:border-zinc-800 shadow-2xl z-[99999] flex flex-col text-left"
        >
          {(() => {
            const y = years.find((item: AcademicYearData) => item.id === dropdownState.id)
            if (!y) return null
            return (
              <>
                <div className="px-3 py-2 border-b border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                  <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400">Opciones</span>
                </div>
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => { setDropdownState(null); onEdit(y); }}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-uecg-text dark:text-zinc-200 hover:bg-uecg-blue hover:text-white transition-colors cursor-pointer border-none bg-transparent w-full text-left outline-none"
                >
                  <Edit className="w-3.5 h-3.5 shrink-0" /> Editar Datos
                </button>

                <button
                  role="menuitem"
                  type="button"
                  id="btn-open-trimesters"
                  data-tour="btn-open-trimesters"
                  onClick={() => { setDropdownState(null); onOpenTrimesters(y); }}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-uecg-text dark:text-zinc-200 hover:bg-uecg-blue hover:text-white transition-colors border-t border-uecg-line dark:border-zinc-800 cursor-pointer border-none bg-transparent w-full text-left outline-none"
                >
                  <Settings2 className="w-3.5 h-3.5 shrink-0" /> Configurar Trimestres
                </button>

                {y.status === 'PLANNING' && (
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => { setDropdownState(null); onStatusChange(y.id, 'ACTIVE'); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white transition-colors border-t border-uecg-line dark:border-zinc-800 cursor-pointer border-none bg-transparent w-full text-left outline-none"
                  >
                    <Power className="w-3.5 h-3.5 shrink-0" /> Activar Gestión
                  </button>
                )}
                {y.status === 'ACTIVE' && (
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => { setDropdownState(null); onStatusChange(y.id, 'CLOSED'); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-400 hover:bg-yellow-600 hover:text-white transition-colors border-t border-uecg-line dark:border-zinc-800 cursor-pointer border-none bg-transparent w-full text-left outline-none"
                  >
                    <PowerOff className="w-3.5 h-3.5 shrink-0" /> Cerrar Gestión
                  </button>
                )}
                {y.status === 'CLOSED' && (
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => { setDropdownState(null); onStatusChange(y.id, 'ACTIVE'); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-uecg-blue dark:text-blue-400 hover:bg-uecg-blue hover:text-white transition-colors border-t border-uecg-line dark:border-zinc-800 cursor-pointer border-none bg-transparent w-full text-left outline-none"
                  >
                    <RefreshCcw className="w-3.5 h-3.5 shrink-0" /> Reactivar Gestión
                  </button>
                )}
                {y.status === 'PLANNING' && (
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => { setDropdownState(null); onDelete(y); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-colors border-t border-uecg-line dark:border-zinc-800 cursor-pointer border-none bg-transparent w-full text-left outline-none"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" /> Eliminar
                  </button>
                )}
              </>
            )
          })()}
        </motion.div>,
        document.body
      )}
    </>
  )
}

