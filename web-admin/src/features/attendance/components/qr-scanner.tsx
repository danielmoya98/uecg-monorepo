import { useEffect, useState, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { ScanLine, UserCheck, Play, Square } from 'lucide-react'
import { toast } from 'sonner'
import { AttendanceService } from '../api/attendance.service'

interface QRScannerProps {
  classPeriodIds: string[]
}

interface LastScanState {
  name: string
  status: string
  time: string
}

export const QRScanner = ({ classPeriodIds }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<LastScanState | null>(null)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const cooldownRef = useRef<Set<string>>(new Set())
  const isStartingRef = useRef(false)

  const playBeep = (type: 'success' | 'warning' | 'error') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'success') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(800, ctx.currentTime)
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        osc.start()
        osc.stop(ctx.currentTime + 0.15)
      } else if (type === 'warning') {
        osc.type = 'square'
        osc.frequency.setValueAtTime(400, ctx.currentTime)
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        osc.start()
        osc.stop(ctx.currentTime + 0.2)
      } else {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(150, ctx.currentTime)
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        osc.start()
        osc.stop(ctx.currentTime + 0.4)
      }
    } catch (e) {
      console.error('Audio API no soportada', e)
    }
  }

  const handleScan = async (decodedText: string) => {
    if (cooldownRef.current.has(decodedText)) return
    cooldownRef.current.add(decodedText)
    setTimeout(() => cooldownRef.current.delete(decodedText), 3000)

    try {
      const result = await AttendanceService.scanQR({
        qrToken: decodedText,
        classPeriodIds: classPeriodIds,
      })

      if (result.message === 'Ya Registrado en este Bloque') {
        playBeep('warning')
        toast.info(`${result.data.studentName} ya registró su asistencia.`)
        setLastScan({
          name: result.data.studentName,
          status: 'YA REGISTRADO',
          time: new Date().toLocaleTimeString('es-BO'),
        })
        return
      }

      const status = result.data.status
      playBeep('success')
      toast.success(`${result.data.studentName} - Asistencia registrada: ${status}`)
      setLastScan({
        name: result.data.studentName,
        status: status === 'PRESENT' ? 'PRESENTE' : status === 'LATE' ? 'ATRASO' : 'LICENCIA',
        time: new Date().toLocaleTimeString('es-BO'),
      })
    } catch (error: unknown) {
      playBeep('error')
      const axiosError = error as { response?: { data?: { message?: string | string[] } } }
      const msg = axiosError.response?.data?.message || 'Error al procesar el código QR'
      toast.error(typeof msg === 'string' ? msg : 'Error de validación')
    }
  }

  const startScanner = async () => {
    if (isStartingRef.current || scannerRef.current?.isScanning) return
    isStartingRef.current = true
    setIsScanning(true)

    try {
      // Aseguramos tener el elemento DOM cargado
      scannerRef.current = new Html5Qrcode('qr-reader')
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScan(decodedText)
        },
        () => {}, // Callback de fallas silencioso para no inundar la consola
      )
    } catch (err) {
      console.error('Error starting scanner', err)
      toast.error('No se pudo acceder a la cámara del dispositivo.')
      setIsScanning(false)
    } finally {
      isStartingRef.current = false
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop()
      } catch (err) {
        console.error('Error stopping scanner', err)
      }
    }
    setIsScanning(false)
  }

  useEffect(() => {
    return () => {
      // Destructor de seguridad completo al desmontar
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch((e) => console.error('Cleanup stop failure', e))
      }
    }
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* CAM PANEL */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="bg-white border border-uecg-line p-6 shadow-sm flex flex-col gap-4 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray flex items-center gap-2">
              <span className="w-4 h-4 bg-uecg-dark text-white flex items-center justify-center font-mono text-[8px]">
                2
              </span>
              Estación Biométrica QR
            </span>
            {isScanning && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 uppercase tracking-widest animate-pulse">
                <span className="w-2 h-2 rounded-full bg-green-600" /> Cámara Activa
              </span>
            )}
          </div>

          <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden border border-uecg-line">
            <div id="qr-reader" className="absolute inset-0 w-full h-full [&_video]:object-cover" />

            {!isScanning && (
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <ScanLine className="w-16 h-16 text-uecg-gray opacity-45 mb-4 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">
                  Cámara Detenida
                </p>
                <p className="text-[9px] font-medium text-gray-400 max-w-xs mt-2">
                  Presione el botón inferior para activar el lector QR y registrar alumnos en tiempo real.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {!isScanning ? (
              <button
                type="button"
                onClick={startScanner}
                className="w-full py-4 font-black uppercase tracking-widest text-[11px] bg-uecg-dark text-white hover:bg-black transition-colors shadow-sm flex items-center justify-center gap-2 outline-none cursor-pointer"
              >
                <Play className="w-4 h-4" /> Iniciar Escáner
              </button>
            ) : (
              <button
                type="button"
                onClick={stopScanner}
                className="w-full py-4 font-black uppercase tracking-widest text-[11px] bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2 outline-none cursor-pointer"
              >
                <Square className="w-4 h-4" /> Detener Escáner
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FEED DE ÚLTIMAS LECTURAS */}
      <div className="lg:col-span-5">
        <div className="bg-white border border-uecg-line shadow-sm h-full flex flex-col min-h-[300px]">
          <div className="bg-uecg-dark p-6 border-b border-uecg-line text-white shrink-0 select-none">
            <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest block leading-none">
              Control de Accesos
            </span>
            <h3 className="text-xl font-black uppercase tracking-tighter mt-1 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-uecg-blue" />
              Última Lectura
            </h3>
          </div>

          <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center overflow-y-auto">
            {!lastScan ? (
              <div className="text-center text-uecg-gray select-none">
                <ScanLine className="w-12 h-12 text-uecg-gray mx-auto mb-3 opacity-30" />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Esperando Credenciales...
                </p>
              </div>
            ) : (
              <div className="w-full bg-white border border-uecg-line p-6 shadow-md relative overflow-hidden animate-in zoom-in-95">
                <div
                  className={`absolute left-0 top-0 bottom-0 w-2 ${
                    lastScan.status === 'PRESENTE'
                      ? 'bg-green-500'
                      : lastScan.status === 'ATRASO'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                  }`}
                />
                <div className="pl-2">
                  <span className="text-[8px] font-black text-uecg-gray uppercase tracking-widest block mb-1">
                    Estudiante Registrado
                  </span>
                  <h4 className="text-lg font-black uppercase tracking-tight text-uecg-dark leading-tight">
                    {lastScan.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-3 select-none">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                        lastScan.status === 'PRESENTE'
                          ? 'text-green-700 bg-green-50 border-green-200'
                          : lastScan.status === 'ATRASO'
                            ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
                            : 'text-blue-700 bg-blue-50 border-blue-200'
                      }`}
                    >
                      {lastScan.status}
                    </span>
                    <span className="text-[9px] font-bold text-uecg-gray tracking-widest font-mono">
                      {lastScan.time}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
