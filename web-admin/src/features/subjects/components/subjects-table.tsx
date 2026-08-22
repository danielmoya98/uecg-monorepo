import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit, Trash2, Search } from 'lucide-react'
import type { Subject } from '../types/subjects.types'
import type { DrawerMode } from '../hooks/use-subjects-data'

interface SubjectsTableProps {
  subjects: Subject[]
  isPending: boolean
  isFetching: boolean
  onAction: (mode: DrawerMode, subject: Subject) => void
  canManage: boolean
}

export default function SubjectsTable({
  subjects,
  isPending,
  isFetching,
  onAction,
  canManage,
}: SubjectsTableProps) {
  if (isPending) {
    return (
      <div className="border border-uecg-line bg-white pb-16 shadow-sm overflow-hidden animate-pulse">
        <div className="h-12 bg-gray-50 border-b border-uecg-line w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`skeleton-row-${i}`} className="h-16 border-b border-uecg-line w-full" />
        ))}
      </div>
    )
  }

  if (subjects.length === 0) {
    return (
      <div className="border border-uecg-line bg-white flex flex-col items-center justify-center py-20 opacity-80 shadow-sm animate-in fade-in zoom-in-95">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-uecg-line rounded-none rotate-12" />
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-gray-100 -rotate-12" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 shadow-sm">
            <Search className="w-6 h-6 text-uecg-gray" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="font-black uppercase tracking-widest text-xs text-uecg-dark mb-1">
          Catálogo Vacío
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-uecg-gray">
          No se encontraron materias con estos filtros.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`border border-uecg-line bg-white pb-16 shadow-sm overflow-hidden transition-opacity duration-200 ${
        isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 border-b border-uecg-line">
              <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
                Nombre de la Asignatura
              </th>
              <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line w-40 text-center">
                Nivel
              </th>
              <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
                Área de Conocimiento
              </th>
              {canManage && (
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray text-center w-24">
                  Operación
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, index) => (
              <SubjectsTableRow
                key={subject.id}
                subject={subject}
                index={index}
                onAction={onAction}
                canManage={canManage}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface SubjectsTableRowProps {
  subject: Subject
  index: number
  onAction: (mode: DrawerMode, subject: Subject) => void
  canManage: boolean
}

function SubjectsTableRow({ subject, index, onAction, canManage }: SubjectsTableRowProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initial = subject.name.charAt(0).toUpperCase()
  let avatarBg = 'bg-uecg-blue'
  if (subject.level === 'INICIAL') avatarBg = 'bg-green-600'
  if (subject.level === 'SECUNDARIA') avatarBg = 'bg-uecg-dark'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <tr
      className="border-b border-uecg-line hover:bg-blue-50/20 transition-colors duration-150 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* 1. Nombre / Avatar */}
      <td className="px-5 py-3.5 border-r border-uecg-line">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-8 h-8 flex items-center justify-center font-black text-xs text-white shadow-sm shrink-0 ${avatarBg}`}
            aria-hidden="true"
          >
            {initial}
          </div>
          <span className="font-black uppercase tracking-tight text-xs text-uecg-text">
            {subject.name}
          </span>
        </div>
      </td>

      {/* 2. Nivel */}
      <td className="px-5 py-3.5 border-r border-uecg-line text-center">
        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 border border-uecg-line bg-gray-50 text-uecg-text inline-block shadow-sm">
          {subject.level}
        </span>
      </td>

      {/* 3. Área */}
      <td className="px-5 py-3.5 border-r border-uecg-line">
        {subject.area ? (
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border border-blue-100 bg-blue-50 text-uecg-blue inline-block">
            {subject.area}
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-widest text-uecg-gray">
            Sin categoría
          </span>
        )}
      </td>

      {/* 4. Operaciones (Solo si tiene permisos) */}
      {canManage && (
        <td className="px-5 py-3.5 text-center">
          <div ref={menuRef} className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-uecg-gray hover:text-uecg-blue hover:bg-gray-100 p-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-uecg-blue"
              aria-haspopup="true"
              aria-expanded={isOpen}
              aria-label={`Acciones para la materia ${subject.name}`}
            >
              <MoreVertical className="w-4 h-4 mx-auto" />
            </button>

            {isOpen && (
              <div
                className="absolute right-0 mt-1 w-44 bg-white border border-uecg-line shadow-2xl z-20 flex flex-col text-left animate-in fade-in zoom-in-95 duration-150"
                role="menu"
                aria-label="Operaciones"
              >
                <div className="px-3.5 py-2 border-b border-uecg-line bg-gray-50">
                  <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray">
                    Acciones
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onAction('edit', subject)
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-uecg-blue hover:text-white transition-all text-uecg-dark cursor-pointer text-left focus:bg-uecg-blue focus:text-white outline-none"
                  role="menuitem"
                >
                  <Edit className="w-3.5 h-3.5" /> Editar Materia
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onAction('delete', subject)
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-3 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-all border-t border-uecg-line cursor-pointer text-left focus:bg-red-600 focus:text-white outline-none"
                  role="menuitem"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar Materia
                </button>
              </div>
            )}
          </div>
        </td>
      )}
    </tr>
  )
}
