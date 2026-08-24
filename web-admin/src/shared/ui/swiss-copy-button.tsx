import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { MorphIcon } from './morph-icon'
import { toast } from 'sonner'

export interface SwissCopyButtonProps {
  text: string
  label?: string
  successMessage?: string
  className?: string
  size?: number
}

/**
 * Botón de copiado con morphing elástico (Copy ⇄ Check) y feedback háptico/toast.
 */
export function SwissCopyButton({
  text,
  label,
  successMessage = 'Copiado al portapapeles',
  className = '',
  size = 13,
}: SwissCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(successMessage, { duration: 1800 })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar al portapapeles')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2 py-1 border border-uecg-line bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-uecg-gray dark:text-zinc-300 hover:text-uecg-dark dark:hover:text-white transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider select-none ${className}`}
      title={`Copiar: ${text}`}
    >
      <MorphIcon
        icon={copied ? Check : Copy}
        size={size}
        strokeWidth={2}
        className={copied ? 'text-emerald-600 dark:text-emerald-400' : 'text-uecg-gray dark:text-zinc-400'}
      />
      {label && <span>{copied ? '¡Copiado!' : label}</span>}
    </button>
  )
}
export default SwissCopyButton
