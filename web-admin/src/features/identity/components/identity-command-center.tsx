import { useRouteContext } from '@tanstack/react-router'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useIdentityData } from '../hooks/use-identity-data'
import { useIdentityExport } from '../hooks/use-identity-export'
import { IdentityHeader, ExportFiltersPanel, ExportActionPanel } from './identity-panels'

function IdentityCommandCenterInner() {
  // 1. Inteligencia ABAC síncrona desde el contexto del Router
  const { can } = useRouteContext({ from: '/_authenticated' })
  const canManageIdentity = can('create:any', 'Identity') || can('manage:all', 'all')

  // 2. Inyección de Datos Académicos
  const {
    currentYear,
    levelFilter,
    setLevelFilter,
    classroomFilter,
    setClassroomFilter,
    levelOptions,
    classroomOptions,
  } = useIdentityData(canManageIdentity)

  // 3. Inyección del Canal de Notificaciones y Motor de Exportación
  const { isExporting, handleMassExport } = useIdentityExport(currentYear?.id)

  // 4. Renderizado de Fallback de Seguridad en UI
  if (!canManageIdentity) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-red-200 bg-red-50/50 shadow-sm w-full min-h-[400px]">
        <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mb-5 animate-pulse">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-red-800 mb-2">
          Acceso Restringido
        </h3>
        <p className="text-xs text-red-700 font-bold uppercase tracking-widest max-w-md leading-relaxed">
          Tu cuenta no cuenta con las facultades operativas suficientes para gestionar el Centro de Carnetización.
        </p>
      </div>
    )
  }

  if (!currentYear) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-uecg-gray">
        <Loader2 className="w-8 h-8 animate-spin text-uecg-blue" />
        <span className="text-[10px] font-black uppercase tracking-widest">
          Cargando Gestión Académica Activa...
        </span>
      </div>
    )
  }

  // 5. Renderizado Principal
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto relative animate-in fade-in duration-300 w-full">
      <IdentityHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-uecg-line shadow-sm bg-white">
        <ExportFiltersPanel
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          levelOptions={levelOptions}
          classroomFilter={classroomFilter}
          setClassroomFilter={setClassroomFilter}
          classroomOptions={classroomOptions}
        />

        <ExportActionPanel
          isExporting={isExporting}
          onExport={() => handleMassExport(levelFilter, classroomFilter)}
        />
      </div>
    </div>
  )
}

export default function IdentityCommandCenter() {
  return <IdentityCommandCenterInner />
}
