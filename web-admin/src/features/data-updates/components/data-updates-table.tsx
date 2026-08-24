import { ShieldAlert, Inbox } from 'lucide-react'
import { SwissTableContainer, SwissEmptyState } from '@/shared/ui'
import type { DataUpdateRequest } from '../types/data-updates.types'

interface DataUpdatesTableProps {
  requests: DataUpdateRequest[]
  isLoading: boolean
  onAudit: (request: DataUpdateRequest) => void
  canManage: boolean
}

export const DataUpdatesTable = ({
  requests,
  isLoading,
  onAudit,
  canManage,
}: DataUpdatesTableProps) => {
  const columnCount = canManage ? 4 : 3

  return (
    <SwissTableContainer isPending={isLoading}>
      <table className="w-full text-left whitespace-nowrap border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-uecg-line dark:border-zinc-800">
            <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">
              Fecha Recepción
            </th>
            <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">
              Estudiante Solicitante
            </th>
            <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800">
              Ubicación Académica
            </th>
            {canManage && (
              <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 text-center w-32">
                Acción
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={`skeleton-update-${i}`} className="border-b border-uecg-line dark:border-zinc-800 animate-pulse">
                <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-zinc-800" />
                </td>
                <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-3 w-40 bg-gray-200 dark:bg-zinc-800 mb-2" />
                  <div className="h-2 w-24 bg-gray-100 dark:bg-zinc-800/60" />
                </td>
                <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-800" />
                </td>
                {canManage && (
                  <td className="px-4 py-4">
                    <div className="h-8 w-20 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                  </td>
                )}
              </tr>
            ))
          ) : requests.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="p-0">
                <SwissEmptyState
                  icon={Inbox}
                  title="Bandeja Limpia"
                  description="No hay actualizaciones de datos pendientes por revisar."
                />
              </td>
            </tr>
          ) : (
            requests.map((req, index) => {
              const student = req.enrollment?.student
              const classroom = req.enrollment?.classroom
              return (
                <tr
                  key={req.id}
                  className="border-b border-uecg-line dark:border-zinc-800 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors group animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800 text-[11px] font-bold text-uecg-gray dark:text-zinc-400 tracking-widest uppercase">
                    {new Date(req.createdAt).toLocaleString('es-BO', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800">
                    <p className="font-black uppercase tracking-tight text-sm text-uecg-dark dark:text-zinc-100">
                      {student?.names || ''} {student?.lastNamePaterno || ''}
                    </p>
                    <p className="text-[10px] font-bold text-uecg-blue dark:text-blue-400 uppercase tracking-widest mt-0.5 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 inline-block border border-blue-100 dark:border-blue-900/40">
                      CI: {student?.ci || 'S/N'}
                    </p>
                  </td>
                  <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1.5 bg-gray-50 dark:bg-zinc-800 text-uecg-dark dark:text-zinc-200 border border-uecg-line dark:border-zinc-700 shadow-sm">
                      {classroom?.grade || 'S/N'} "{classroom?.section || ''}" — {classroom?.level || 'S/N'}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => onAudit(req)}
                        className="px-6 py-3 font-black uppercase tracking-widest text-[10px] border border-uecg-blue dark:border-blue-500 bg-white dark:bg-[#121214] text-uecg-blue dark:text-blue-400 hover:bg-uecg-blue dark:hover:bg-blue-600 hover:text-white transition-colors shadow-sm w-full flex items-center justify-center gap-2 cursor-pointer outline-none"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" /> Auditar
                      </button>
                    </td>
                  )}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </SwissTableContainer>
  )
}
export default DataUpdatesTable
