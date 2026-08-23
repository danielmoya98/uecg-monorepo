import { useMemo } from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthMeterProps {
  password: string
}

interface Requirement {
  label: string
  valid: boolean
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label, colorClass, requirements } = useMemo(() => {
    const reqs: Requirement[] = [
      { label: 'Mínimo 8 caracteres', valid: password.length >= 8 },
      { label: 'Al menos una mayúscula (A-Z)', valid: /[A-Z]/.test(password) },
      { label: 'Al menos un número (0-9)', valid: /[0-9]/.test(password) },
      { label: 'Carácter especial (!@#$%^&*)', valid: /[^A-Za-z0-9]/.test(password) },
    ]

    const passedCount = reqs.filter((r) => r.valid).length

    if (!password) {
      return {
        score: 0,
        label: 'Sin ingresar',
        colorClass: 'bg-gray-200',
        requirements: reqs,
      }
    }

    if (passedCount <= 1) {
      return {
        score: 1,
        label: 'Débil',
        colorClass: 'bg-red-500',
        requirements: reqs,
      }
    }

    if (passedCount === 2) {
      return {
        score: 2,
        label: 'Aceptable',
        colorClass: 'bg-amber-500',
        requirements: reqs,
      }
    }

    if (passedCount === 3) {
      return {
        score: 3,
        label: 'Buena',
        colorClass: 'bg-blue-500',
        requirements: reqs,
      }
    }

    return {
      score: 4,
      label: 'Excelente',
      colorClass: 'bg-emerald-500',
      requirements: reqs,
    }
  }, [password])

  if (!password) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-50 border border-uecg-line text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[10px] uppercase tracking-wider text-uecg-text/70">
          Seguridad: <span className="text-uecg-dark font-black">{label}</span>
        </span>
        <span className="font-mono text-[10px] text-uecg-text/50">
          {score}/4
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-gray-200">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full transition-all duration-300 ${
              score >= step ? colorClass : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
        {requirements.map((req, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 text-[10px] ${
              req.valid ? 'text-emerald-700 font-semibold' : 'text-gray-400'
            }`}
          >
            {req.valid ? (
              <Check className="w-3 h-3 text-emerald-600 shrink-0" strokeWidth={3} />
            ) : (
              <X className="w-3 h-3 text-gray-400 shrink-0" strokeWidth={2} />
            )}
            <span className="truncate">{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
