import { ServerCrash } from 'lucide-react'
import { SwissTableContainer, SwissEmptyState } from '@/shared/ui'
import type { AuditLog } from '../types/audit.types'

interface AuditTableProps {
  logs: AuditLog[]
  isLoading: boolean
}

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'DELETE':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'PATCH':
    case 'PUT':
      return 'bg-blue-50 text-uecg-blue border-blue-200'
    default:
      return 'bg-gray-50 text-uecg-gray border-gray-200'
  }
}

const getStatusColor = (code: number) => {
  if (code >= 200 && code < 300) return 'text-green-600 font-bold'
  if (code >= 400 && code < 500) return 'text-yellow-600 font-bold'
  return 'text-red-600 font-bold'
}

const formatAuditDate = (dateString: string): string => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'FECHA INVÁLIDA'

  const day = String(date.getDate()).padStart(2, '0')
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  const month = months[date.getMonth()]
  const year = String(date.getFullYear()).slice(-2)

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

export const AuditTable = ({ logs, isLoading }: AuditTableProps) => {
  return (
    <SwissTableContainer isPending={isLoading}>
      <table className="w-full text-left border-collapse" aria-busy={isLoading}>
        <caption className="sr-only">
          Trazabilidad y registro de auditoría global del sistema
        </caption>
        <thead>
          <tr className="bg-gray-50 border-b border-uecg-line">
            <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Timestamp
            </th>
            <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Actor
            </th>
            <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line text-center">
              Método
            </th>
            <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
              Ruta (Endpoint)
            </th>
            <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line text-center">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray text-right">
              Dirección IP
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-audit-${i}`} className="border-b border-uecg-line animate-pulse">
                <td className="px-4 py-4 border-r border-uecg-line">
                  <div className="h-3 w-32 bg-gray-200" />
                </td>
                <td className="px-4 py-4 border-r border-uecg-line">
                  <div className="h-3 w-24 bg-gray-200 mb-1.5" />
                  <div className="h-2 w-32 bg-gray-100" />
                </td>
                <td className="px-4 py-4 border-r border-uecg-line">
                  <div className="h-5 w-12 bg-gray-200 mx-auto" />
                </td>
                <td className="px-4 py-4 border-r border-uecg-line">
                  <div className="h-3 w-48 bg-gray-100" />
                </td>
                <td className="px-4 py-4 border-r border-uecg-line">
                  <div className="h-3 w-8 bg-gray-200 mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-3 w-24 bg-gray-100 ml-auto" />
                </td>
              </tr>
            ))
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-0">
                <SwissEmptyState
                  icon={ServerCrash}
                  title="Sistema en Blanco"
                  description="No hay eventos registrados en el servidor."
                />
              </td>
            </tr>
          ) : (
            logs.map((log: AuditLog, index: number) => (
              <tr
                key={log.id}
                className="border-b border-uecg-line hover:bg-blue-50/30 transition-colors group animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td className="px-4 py-3 border-r border-uecg-line text-uecg-gray whitespace-nowrap font-mono text-[10px]">
                  {formatAuditDate(log.createdAt)}
                </td>
                <td className="px-4 py-3 border-r border-uecg-line">
                  {log.user ? (
                    <div className="flex flex-col">
                      <span className="font-black text-uecg-text text-xs uppercase tracking-tight">
                        {log.user.fullName}
                      </span>
                      <span className="text-[9px] text-uecg-gray font-bold tracking-widest mt-0.5">
                        {log.user.email}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                      ANÓNIMO / SISTEMA
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 border-r border-uecg-line text-center">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border shadow-sm ${getMethodColor(log.method)}`}
                  >
                    {log.method}
                  </span>
                </td>
                <td
                  className="px-4 py-3 border-r border-uecg-line text-uecg-dark font-mono text-[11px] truncate max-w-xs"
                  title={log.route}
                >
                  {log.route}
                </td>
                <td
                  className={`px-4 py-3 border-r border-uecg-line text-center font-black font-mono text-[11px] ${getStatusColor(log.statusCode)}`}
                >
                  {log.statusCode}
                </td>
                <td className="px-4 py-3 text-right text-uecg-gray font-mono text-[10px]">
                  {log.ipAddress?.replace('::ffff:', '') || 'Desconocida'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </SwissTableContainer>
  )
}
export default AuditTable
