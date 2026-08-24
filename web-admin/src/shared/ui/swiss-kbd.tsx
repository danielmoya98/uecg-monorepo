import React from 'react'

export interface SwissKbdProps {
  children: React.ReactNode
  className?: string
}

/**
 * Insignia de atajo de teclado geométrica estilo Swiss Brutalism.
 */
export function SwissKbd({ children, className = '' }: SwissKbdProps) {
  return (
    <kbd
      className={`inline-flex items-center justify-center font-mono text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-uecg-line bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 text-uecg-gray dark:text-zinc-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] select-none pointer-events-none ${className}`}
    >
      {children}
    </kbd>
  )
}

export default SwissKbd
