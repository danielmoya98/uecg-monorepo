import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'

import { SwissInput } from '@/shared/ui/swiss-input'
import {
  loginSchema,
  type LoginFormValues,
} from '../schemas/auth.schema'
import { useLogin } from '../hooks/use-login'

export function LoginForm() {
  const loginMutation = useLogin()
  const [showPassword, setShowPassword] = useState(false)

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

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      email: data.email.trim().toLowerCase(),
      password: data.password
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-6"
      noValidate
    >
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
          Credenciales
        </h2>
      </header>

      <div className="flex flex-col gap-5">
        <SwissInput
          id="email"
          type="email"
          label="Correo Institucional"
          placeholder="ejemplo@uecg.edu.bo"
          className="font-bold text-xs bg-gray-50 focus:bg-white transition-colors"
          error={errors.email?.message}
          disabled={
            loginMutation.isPending
          }
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
          disabled={
            loginMutation.isPending
          }
          autoComplete="current-password"
          rightElement={passwordRightElement}
          required
          {...register('password')}
        />
      </div>

      <button
        type="submit"
        disabled={
          loginMutation.isPending
        }
        className="w-full mt-4 py-4 px-6 bg-uecg-dark text-white font-black text-[11px] uppercase tracking-widest hover:bg-uecg-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
      >
        {loginMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LockKeyhole className="w-4 h-4" />
        )}

        {loginMutation.isPending
          ? 'Validando...'
          : 'Autorizar Ingreso'}
      </button>
    </form>
  )
}
