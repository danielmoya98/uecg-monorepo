import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import { SwissTableContainer, SwissEmptyState } from '@/shared/ui'
import type { Subject } from '../types/subjects.types'
import type { DrawerMode } from '../hooks/use-subjects-data'

interface SubjectsTableProps {
  subjects: Subject[]
  isPending: boolean
  isFetching: boolean
  onAction: (mode: DrawerMode, subject: Subject) => void
  onToggleStatus?: (subject: Subject) => void
  canManage: boolean
}

export default function SubjectsTable({
  subjects,
  isPending,
  isFetching,
  onAction,
  canManage,
}: SubjectsTableProps) {
  return (
    <SwissTableContainer isFetching={isFetching} isPending={isPending}>
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-gray-50 border-b border-uecg-line">
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Nombre de la Asignatura
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line w-28 text-center">
              Sigla
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line w-36 text-center">
              Nivel
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Área de Conocimiento
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line w-28 text-center">
              Estado
            </th>
            {canManage && (
              <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray text-center w-24">
                Operación
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-subject-${i}`} className="border-b border-uecg-line animate-pulse">
                <td className="px-5 py-4 border-r border-uecg-line flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 shrink-0" />
                  <div className="h-3 w-40 bg-gray-200" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line">
                  <div className="h-4 w-12 bg-gray-200 mx-auto" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line">
                  <div className="h-5 w-20 bg-gray-200 mx-auto" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line">
                  <div className="h-4 w-32 bg-gray-200" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line">
                  <div className="h-4 w-16 bg-gray-200 mx-auto" />
                </td>
                {canManage && (
                  <td className="px-5 py-4">
                    <div className="h-4 w-4 bg-gray-200 mx-auto" />
                  </td>
                )}
              </tr>
            ))
          ) : subjects.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 6 : 5} className="p-0">
                <SwissEmptyState
                  title="Sin materias encontradas"
                  description="No se hallaron asignaturas para los filtros seleccionados."
                />
              </td>
            </tr>
          ) : (
            subjects.map((subject, index) => (
              <SubjectsTableRow
                key={subject.id}
                subject={subject}
                index={index}
                onAction={onAction}
                canManage={canManage}
              />
            ))
          )}
        </tbody>
      </table>
    </SwissTableContainer>
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <tr
      className={`border-b border-uecg-line hover:bg-blue-50/20 transition-colors duration-150 animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
        !subject.isActive ? 'bg-gray-50/40 opacity-75' : ''
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Nombre */}
      <td className="px-5 py-3.5 border-r border-uecg-line">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-uecg-blue text-white font-black text-xs shadow-sm shrink-0">
            {(subject.code || subject.name).substring(0, 2).toUpperCase()}
          </div>
          <span className="font-black uppercase tracking-tight text-xs text-uecg-text">
            {subject.name}
          </span>
        </div>
      </td>

      {/* Sigla */}
      <td className="px-5 py-3.5 border-r border-uecg-line text-center">
        <span className="font-mono text-xs font-bold text-uecg-blue bg-blue-50 px-2 py-0.5 border border-blue-200">
          {subject.code || 'S/C'}
        </span>
      </td>

      {/* Nivel */}
      <td className="px-5 py-3.5 border-r border-uecg-line text-center">
        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border bg-gray-100 text-uecg-dark border-uecg-line">
          {subject.level}
        </span>
      </td>

      {/* Área */}
      <td className="px-5 py-3.5 border-r border-uecg-line text-xs font-bold text-uecg-gray uppercase">
        {subject.area || 'GENERAL'}
      </td>

      {/* Estado */}
      <td className="px-5 py-3.5 border-r border-uecg-line text-center">
        <span
          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${
            subject.isActive
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-600 border-red-100'
          }`}
        >
          {subject.isActive ? 'ACTIVA' : 'INACTIVA'}
        </span>
      </td>

      {/* Acciones */}
      {canManage && (
        <td className="px-5 py-3.5 text-center">
          <div ref={menuRef} className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-uecg-gray hover:text-uecg-blue hover:bg-gray-100 p-2 transition-all cursor-pointer focus:outline-none"
              aria-label={`Opciones para ${subject.name}`}
            >
              <MoreVertical className="w-4 h-4 mx-auto" />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-uecg-line shadow-2xl z-20 flex flex-col text-left animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-uecg-line bg-gray-50">
                  <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray">
                    Operación
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onAction('edit', subject)
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-uecg-blue hover:text-white transition-all text-uecg-dark cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onAction('delete', subject)
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-all border-t border-uecg-line cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            )}
          </div>
        </td>
      )}
    </tr>
  )
}
