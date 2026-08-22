import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
}

export function SetupLayout({
  children,
}: Props) {
  return (
    <main className="flex min-h-screen flex-col bg-white lg:flex-row">
      <section className="relative flex flex-col justify-between overflow-hidden bg-uecg-dark text-white p-10 lg:w-[55%] lg:p-20 border-r border-uecg-line">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
          animate={{ opacity: 0.05, scale: 1, rotate: -12 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -right-12 top-12 w-80 h-80 border-[16px] border-white"
        />

        <div className="relative z-10">
          <motion.span
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-red-300 block mb-2"
          >
            Seguridad Requerida
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-7xl font-black tracking-tighter leading-none"
          >
            PROTOCOLO
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10"
        >
          <p className="max-w-lg text-sm text-white/70 border-l-2 border-red-600 pl-4">
            Actualización obligatoria de clave institucional para la
            protección del expediente académico.
          </p>
        </motion.div>
      </section>

      <section className="relative flex items-center justify-center p-8 lg:w-[45%] lg:p-16 bg-gray-50">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 100, damping: 15 }}
          className="w-full max-w-md bg-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-uecg-line relative"
        >
          {children}
        </motion.div>
      </section>
    </main>
  )
}
