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
          <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-uecg-line dark:border-zinc-800">
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">
              Nombre de la Asignatura
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 w-28 text-center">
              Sigla
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 w-36 text-center">
              Nivel
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">
              Área de Conocimiento
            </th>
            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 w-28 text-center">
              Estado
            </th>
            {canManage && (
              <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 text-center w-24">
                Operación
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-subject-${i}`} className="border-b border-uecg-line dark:border-zinc-800 animate-pulse">
                <td className="px-5 py-4 border-r border-uecg-line dark:border-zinc-800 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-800 shrink-0" />
                  <div className="h-3 w-40 bg-gray-200 dark:bg-zinc-800" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-4 w-12 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-5 w-20 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-3 w-32 bg-gray-200 dark:bg-zinc-800" />
                </td>
                <td className="px-5 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-5 w-16 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                </td>
                {canManage && (
                  <td className="px-5 py-4">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                  </td>
                )}
              </tr>
            ))
          ) : subjects.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 6 : 5} className="p-0">
                <SwissEmptyState
                  title="Catálogo Vacío"
                  description="No se encontraron materias con los filtros actuales."
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
      className={`border-b border-uecg-line dark:border-zinc-800 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors duration-150 animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
        !subject.isActive ? 'bg-gray-50/40 dark:bg-zinc-900/40 opacity-75' : ''
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Nombre */}
      <td className="px-5 py-3.5 border-r border-uecg-line dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-uecg-blue dark:bg-blue-600 text-white font-black text-xs shadow-sm shrink-0">
            {(subject.code || subject.name).substring(0, 2).toUpperCase()}
          </div>
          <span className="font-black uppercase tracking-tight text-xs text-uecg-text dark:text-zinc-100">
            {subject.name}
          </span>
        </div>
      </td>

      {/* Sigla */}
      <td className="px-5 py-3.5 border-r border-uecg-line dark:border-zinc-800 text-center">
        <span className="font-mono text-xs font-bold text-uecg-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 border border-blue-200 dark:border-blue-900/50">
          {subject.code || 'S/C'}
        </span>
      </td>

      {/* Nivel */}
      <td className="px-5 py-3.5 border-r border-uecg-line dark:border-zinc-800 text-center">
        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border bg-gray-100 dark:bg-zinc-800 text-uecg-dark dark:text-zinc-200 border-uecg-line dark:border-zinc-700">
          {subject.level}
        </span>
      </td>

      {/* Área */}
      <td className="px-5 py-3.5 border-r border-uecg-line dark:border-zinc-800 text-xs font-bold text-uecg-gray dark:text-zinc-400 uppercase">
        {subject.area || 'GENERAL'}
      </td>


      {/* Estado */}
      <td className="px-5 py-3.5 border-r border-uecg-line dark:border-zinc-800 text-center">
        <span
          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${
            subject.isActive
              ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/40'
              : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40'
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
              className="text-uecg-gray dark:text-zinc-400 hover:text-uecg-blue dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 p-2 transition-all cursor-pointer focus:outline-none"
              aria-label={`Opciones para ${subject.name}`}
            >
              <MoreVertical className="w-4 h-4 mx-auto" />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#121214] border border-uecg-line dark:border-zinc-800 shadow-2xl z-20 flex flex-col text-left animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                  <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400">
                    Operación
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onAction('edit', subject)
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-uecg-blue hover:text-white transition-all text-uecg-dark dark:text-zinc-200 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onAction('delete', subject)
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-[9px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all border-t border-uecg-line dark:border-zinc-800 cursor-pointer"
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
