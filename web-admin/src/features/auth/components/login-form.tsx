import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  QrCode,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

import { SwissInput } from '@/shared/ui/swiss-input'
import {
  loginSchema,
  type LoginFormValues,
} from '../schemas/auth.schema'
import { useLogin } from '../hooks/use-login'
import { AuthService } from '../api/auth.service'
import { QrLoginPanel } from './qr-login-panel'

export function LoginForm() {
  const loginMutation = useLogin()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'CREDENTIALS' | 'QR'>('CREDENTIALS')
  const [isUninitialized, setIsUninitialized] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    let mounted = true
    AuthService.getSystemStatus()
      .then((status) => {
        if (mounted && !status.isInitialized) {
          setIsUninitialized(true)
          navigate({ to: '/setup-wizard' as any })
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [navigate])

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    })
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const passwordRightElement = (
    <button
      type="button"
      onClick={togglePasswordVisibility}
      disabled={loginMutation.isPending}
      className="p-1 text-uecg-text/50 hover:text-uecg-blue transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {showPassword ? (
        <EyeOff className="w-4 h-4" strokeWidth={2} />
      ) : (
        <Eye className="w-4 h-4" strokeWidth={2} />
      )}
    </button>
  )

  return (
    <div className="flex w-full flex-col gap-6">
      {isUninitialized && (
        <div className="p-3 bg-blue-50 border border-uecg-blue text-uecg-blue flex items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              Sistema sin inicializar
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: '/setup-wizard' as any })}
            className="text-[10px] font-black uppercase tracking-wider bg-uecg-blue text-white px-2 py-1 flex items-center gap-1 hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Setup Wizard <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      <header className="mb-2 border-b border-uecg-line pb-5">
        <div className="flex items-center gap-2 mb-2 text-uecg-blue">
          <ShieldCheck
            className="w-4 h-4"
            strokeWidth={2.5}
          />

          <span className="text-[9px] font-black uppercase tracking-widest">
            Portal de Acceso
          </span>
        </div>

        <h2 className="text-3xl font-black tracking-tighter uppercase text-uecg-dark leading-none">
          Identificación
        </h2>

        {/* SELECTOR DE PESTAÑAS SUIZO */}
        <div className="grid grid-cols-2 gap-2 mt-4 bg-gray-100 p-1 border border-uecg-line">
          <button
            type="button"
            onClick={() => setActiveTab('CREDENTIALS')}
            className={`py-2 px-3 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'CREDENTIALS'
                ? 'bg-white text-uecg-dark shadow-sm border border-uecg-line'
                : 'text-uecg-gray hover:text-uecg-dark'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Credenciales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('QR')}
            className={`py-2 px-3 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'QR'
                ? 'bg-white text-uecg-dark shadow-sm border border-uecg-line'
                : 'text-uecg-gray hover:text-uecg-dark'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> Acceso QR
          </button>
        </div>
      </header>

      {activeTab === 'CREDENTIALS' ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-6"
          noValidate
        >
          <div className="flex flex-col gap-5">
            <SwissInput
              id="email"
              type="email"
              label="Correo Institucional"
              placeholder="ejemplo@uecg.edu.bo"
              className="font-bold text-xs bg-gray-50 focus:bg-white transition-colors"
              error={errors.email?.message}
              disabled={loginMutation.isPending}
              autoComplete="username"
              inputMode="email"
              required
              {...register('email')}
            />

            <SwissInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              placeholder="••••••••"
              className="font-mono tracking-widest text-lg bg-gray-50 focus:bg-white transition-colors"
              error={errors.password?.message}
              disabled={loginMutation.isPending}
              autoComplete="current-password"
              rightElement={passwordRightElement}
              required
              {...register('password')}
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full mt-4 py-4 px-6 bg-uecg-dark text-white font-black text-[11px] uppercase tracking-widest hover:bg-uecg-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
          >
            {loginMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LockKeyhole className="w-4 h-4" />
            )}

            {loginMutation.isPending ? 'Validando...' : 'Autorizar Ingreso'}
          </button>
        </form>
      ) : (
        <QrLoginPanel />
      )}
    </div>
  )
}
