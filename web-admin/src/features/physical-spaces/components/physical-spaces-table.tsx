import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { SwissTableContainer, SwissEmptyState } from '@/shared/ui'
import type { PhysicalSpace } from '../types/physical-spaces.types'

const SpaceBadge = ({ type }: { type: string }) => {
  let bgColor = 'bg-uecg-blue'
  let letter = 'S'

  if (type === 'LABORATORIO') {
    bgColor = 'bg-indigo-600'
    letter = 'L'
  }
  if (type === 'CANCHA') {
    bgColor = 'bg-green-600'
    letter = 'C'
  }
  if (type === 'AUDITORIO') {
    bgColor = 'bg-purple-600'
    letter = 'A'
  }
  if (type === 'OTRO') {
    bgColor = 'bg-gray-600'
    letter = 'O'
  }

  return (
    <div
      className={`w-10 h-10 flex items-center justify-center ${bgColor} text-white font-black text-lg shadow-sm shrink-0`}
    >
      {letter}
    </div>
  )
}

interface RowProps {
  space: PhysicalSpace
  index: number
  onEdit: (space: PhysicalSpace) => void
  onDeletePrompt: (space: PhysicalSpace) => void
  canManage: boolean
}

const PhysicalSpacesTableRow = ({ space, index, onEdit, onDeletePrompt, canManage }: RowProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <tr
      className="border-b border-uecg-line hover:bg-blue-50/30 transition-colors group animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <td className="px-4 py-3.5 border-r border-uecg-line">
        <div className="flex items-center gap-4">
          <SpaceBadge type={space.type} />
          <div>
            <p className="font-black uppercase tracking-tight text-xs text-uecg-dark">{space.name}</p>
            <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest mt-0.5">
              ID: {space.id.split('-')[0]}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 border-r border-uecg-line">
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-gray-50 text-uecg-dark border border-uecg-line shadow-sm">
          {space.type}
        </span>
      </td>
      <td className="px-4 py-3.5 border-r border-uecg-line text-center">
        {space.isActive ? (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 shadow-sm">
            <span className="w-1.5 h-1.5 bg-green-500 mr-2 rounded-full animate-pulse" /> ACTIVO
          </span>
        ) : (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-widest text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 shadow-sm">
            <span className="w-1.5 h-1.5 bg-red-500 mr-2 rounded-full" /> INACTIVO
          </span>
        )}
      </td>

      {canManage && (
        <td className="px-4 py-3.5 text-center">
          <div ref={menuRef} className="relative inline-block">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-uecg-gray hover:text-uecg-blue transition-colors focus:outline-none p-1.5 rounded-none bg-transparent hover:bg-white border border-transparent hover:border-uecg-line cursor-pointer"
              aria-label="Acciones de espacio"
            >
              <MoreVertical className="w-4 h-4 mx-auto" />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-8 w-40 bg-white border border-uecg-line shadow-2xl z-20 flex flex-col text-left animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-2 border-b border-uecg-line bg-gray-50">
                  <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray">
                    Acciones
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onEdit(space)
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-uecg-blue hover:text-white transition-colors outline-none cursor-pointer text-left w-full text-uecg-dark"
                >
                  <Edit2 className="w-3.5 h-3.5 shrink-0" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onDeletePrompt(space)
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-colors border-t border-uecg-line outline-none cursor-pointer text-left w-full"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" /> Eliminar
                </button>
              </div>
            )}
          </div>
        </td>
      )}
    </tr>
  )
}

interface TableProps {
  spaces: PhysicalSpace[]
  isPending: boolean
  onEdit: (space: PhysicalSpace) => void
  onDeletePrompt: (space: PhysicalSpace) => void
  canManage: boolean
}

export default function PhysicalSpacesTable({
  spaces,
  isPending,
  onEdit,
  onDeletePrompt,
  canManage,
}: TableProps) {
  const columnCount = canManage ? 4 : 3

  return (
    <SwissTableContainer isPending={isPending}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-uecg-line">
            <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Nombre / Identificador
            </th>
            <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Tipo de Espacio
            </th>
            <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line text-center">
              Estado
            </th>
            {canManage && (
              <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray text-center">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`loader-${i}`} className="border-b border-uecg-line animate-pulse">
                <td colSpan={columnCount} className="px-4 py-6 bg-white">
                  <div className="h-6 bg-gray-100 w-3/4" />
                </td>
              </tr>
            ))
          ) : spaces.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="p-0">
                <SwissEmptyState
                  title="No se encontraron registros"
                  description="Intente cambiar los filtros o el término de búsqueda."
                />
              </td>
            </tr>
          ) : (
            spaces.map((space, index) => (
              <PhysicalSpacesTableRow
                key={space.id}
                space={space}
                index={index}
                onEdit={onEdit}
                onDeletePrompt={onDeletePrompt}
                canManage={canManage}
              />
            ))
          )}
        </tbody>
      </table>
    </SwissTableContainer>
  )
}
