import { Loader2, AlertTriangle } from 'lucide-react'
import { QRScanner } from './qr-scanner'
import type { DailyBlock, AttendanceSettings } from '../types/attendance.types'

interface QRScannerViewProps {
  loadingSettings: boolean
  settings?: AttendanceSettings
  selectedBlock: DailyBlock
}

export const QRScannerView = ({
  loadingSettings,
  settings,
  selectedBlock,
}: QRScannerViewProps) => {
  if (loadingSettings) {
    return (
      <div className="flex flex-col items-center justify-center p-16 border border-uecg-line bg-white shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-uecg-blue mb-4" />
        <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">
          Cargando configuración de la institución...
        </span>
      </div>
    )
  }

  if (settings && !settings.enableQrAttendance) {
    return (
      <div className="p-16 border border-uecg-line bg-white text-center shadow-sm select-none animate-in fade-in duration-300">
        <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3 opacity-80" />
        <h3 className="text-sm font-black uppercase tracking-widest text-uecg-dark">
          Estación QR Deshabilitada
        </h3>
        <p className="text-xs font-bold text-uecg-gray mt-2 max-w-md mx-auto">
          El control de asistencia por código QR se encuentra apagado en la configuración global de la institución. 
          Debe habilitarlo primero en el panel de Administración de Aulas / Configuración.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-300">
      <QRScanner classPeriodIds={selectedBlock.classPeriodIds} />
    </div>
  )
}
