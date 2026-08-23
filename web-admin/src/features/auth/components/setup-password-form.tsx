import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'

import { SwissInput } from '@/shared/ui/swiss-input'
import { PasswordStrengthMeter } from './password-strength-meter'
import {
  setupPasswordSchema,
  type SetupPasswordValues,
} from '../schemas/auth.schema'
import { useSetupPassword } from '../hooks/use-setup-password'

export function SetupPasswordForm() {
  const navigate = useNavigate()
  const setupMutation = useSetupPassword()

  const [showTempPassword, setShowTempPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetupPasswordValues>({
    resolver: zodResolver(setupPasswordSchema),
    defaultValues: {
      tempPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPasswordValue = watch('newPassword')

  useEffect(() => {
    const token = localStorage.getItem('uecg_setup_token')
    if (!token) {
      toast.error('Sesión inválida')
      navigate({ to: '/' })
    }
  }, [navigate])

  const onSubmit = (data: SetupPasswordValues) => {
    const setupToken = localStorage.getItem('uecg_setup_token')
    if (!setupToken) return

    setupMutation.mutate({
      setupToken,
      newPassword: data.newPassword,
    })
  }

  const makePasswordToggle = (
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    label: string,
  ) => (
    <button
      type="button"
      onClick={() => setVisible((v) => !v)}
      disabled={setupMutation.isPending}
      className="p-1 text-uecg-text/50 hover:text-uecg-blue transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
      aria-label={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
    >
      {visible ? (
        <EyeOff className="w-4 h-4" strokeWidth={2} />
      ) : (
        <Eye className="w-4 h-4" strokeWidth={2} />
      )}
    </button>
  )

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <header className="mb-2 border-b border-uecg-line pb-5">
        <div className="flex items-center gap-2 mb-2 text-red-600">
          <ShieldCheck className="w-4 h-4" />

          <span className="text-[9px] font-black uppercase tracking-widest">
            Paso Obligatorio
          </span>
        </div>

        <h2 className="text-3xl font-black tracking-tighter uppercase text-uecg-dark leading-none">
          Nueva Clave
        </h2>
      </header>

      <div className="flex flex-col gap-5">
        <SwissInput
          id="tempPassword"
          type={showTempPassword ? 'text' : 'password'}
          label="Clave Temporal"
          placeholder="Ingrese clave temporal"
          error={errors.tempPassword?.message}
          disabled={setupMutation.isPending}
          autoComplete="current-password"
          rightElement={makePasswordToggle(showTempPassword, setShowTempPassword, 'clave temporal')}
          required
          {...register('tempPassword')}
        />

        <SwissInput
          id="newPassword"
          type={showNewPassword ? 'text' : 'password'}
          label="Nueva Clave"
          placeholder="Nueva contraseña"
          error={errors.newPassword?.message}
          disabled={setupMutation.isPending}
          autoComplete="new-password"
          rightElement={makePasswordToggle(showNewPassword, setShowNewPassword, 'nueva clave')}
          required
          {...register('newPassword')}
        />

        <PasswordStrengthMeter password={newPasswordValue || ''} />

        <SwissInput
          id="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirmar Clave"
          placeholder="Repita contraseña"
          error={errors.confirmPassword?.message}
          disabled={setupMutation.isPending}
          autoComplete="new-password"
          rightElement={makePasswordToggle(showConfirmPassword, setShowConfirmPassword, 'confirmación de clave')}
          required
          {...register('confirmPassword')}
        />
      </div>

      <button
        type="submit"
        disabled={setupMutation.isPending}
        className="w-full mt-4 py-4 px-6 bg-red-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
      >
        {setupMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Actualizar e Ingresar
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  )
}
