import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { QrCode, RefreshCw, Loader2, CheckCircle2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { queryClient } from '@/app/providers/query-provider'
import { AuthService } from '../api/auth.service'
import type { AuthUser } from '../types/auth.types'

export function QrLoginPanel() {
  const navigate = useNavigate()
  const router = useRouter()

  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [qrPayload, setQrPayload] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(300)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false)

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleAuthorizedLogin = useCallback(async (user: AuthUser) => {
    setIsAuthorized(true)
    if (pollingRef.current) clearInterval(pollingRef.current)
    if (timerRef.current) clearInterval(timerRef.current)

    AuthService.saveSessionMetadata(user)
    document.cookie = 'uecg_is_logged_in=true; path=/; max-age=28800; SameSite=Lax'
    queryClient.clear()
    await router.invalidate()

    toast.success(`Acceso concedido. ¡Bienvenido(a) ${user.fullName}!`)
    navigate({ to: '/dashboard' })
  }, [navigate, router])

  const fetchNewChallenge = useCallback(async () => {
    setIsLoading(true)
    if (pollingRef.current) clearInterval(pollingRef.current)
    if (timerRef.current) clearInterval(timerRef.current)

    try {
      const res = await AuthService.createQrChallenge()
      if (res.challengeId) {
        setChallengeId(res.challengeId)
        setQrPayload(res.qrPayload)
        setTimeLeft(res.expiresIn || 120)
      }
    } catch {
      toast.error('No se pudo generar el código QR')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNewChallenge()
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetchNewChallenge])

  // Timer countdown
  useEffect(() => {
    if (!challengeId || isAuthorized) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          if (pollingRef.current) clearInterval(pollingRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [challengeId, isAuthorized])

  // Polling challenge status
  useEffect(() => {
    if (!challengeId || isAuthorized || timeLeft === 0) return

    pollingRef.current = setInterval(async () => {
      try {
        const res = await AuthService.getQrChallengeStatus(challengeId)
        if (res.status === 'AUTHORIZED' && res.user) {
          handleAuthorizedLogin(res.user)
        } else if (res.status === 'EXPIRED') {
          if (pollingRef.current) clearInterval(pollingRef.current)
          setTimeLeft(0)
        }
      } catch {
        // Ignoramos errores transitorios de polling
      }
    }, 2000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [challengeId, isAuthorized, timeLeft, handleAuthorizedLogin])

  const qrImageUrl = qrPayload
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
        qrPayload,
      )}&color=0a192f&bgcolor=ffffff&margin=1`
    : ''

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-uecg-blue flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> Acceso Rápido para Docentes
        </span>
        <p className="text-xs text-uecg-gray leading-relaxed max-w-xs">
          Abra la aplicación móvil <strong>UECG</strong> en su teléfono y escanee el código para ingresar.
        </p>
      </div>

      <div className="relative p-4 bg-white border-2 border-uecg-line shadow-inner flex flex-col items-center justify-center w-56 h-56">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-uecg-blue" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-uecg-gray">
              Generando QR...
            </span>
          </div>
        ) : isAuthorized ? (
          <div className="flex flex-col items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-12 h-12" />
            <span className="text-xs font-black uppercase tracking-wider">
              ¡Autorizado!
            </span>
          </div>
        ) : timeLeft === 0 ? (
          <div className="flex flex-col items-center gap-3 p-2 bg-gray-50/90 w-full h-full justify-center">
            <QrCode className="w-8 h-8 text-gray-400 opacity-40" />
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
              Código Expirado
            </span>
            <button
              onClick={fetchNewChallenge}
              className="py-2 px-3 bg-uecg-dark text-white text-[10px] font-black uppercase tracking-widest hover:bg-uecg-blue transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Generar Nuevo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img
              src={qrImageUrl}
              alt="Código QR de Acceso Web"
              className="w-44 h-44 object-contain transition-opacity duration-300"
            />
          </div>
        )}
      </div>

      {!isLoading && !isAuthorized && timeLeft > 0 && (
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="flex items-center justify-between w-full max-w-xs text-[10px] font-mono text-uecg-gray">
            <span>Expira en:</span>
            <span className="font-bold text-uecg-dark">{timeLeft}s</span>
          </div>
          <div className="w-full max-w-xs bg-gray-200 h-1 overflow-hidden">
            <div
              className="bg-uecg-blue h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 300) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
