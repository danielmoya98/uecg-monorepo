import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from '@tanstack/react-router'
import { Sidebar } from '@/shared/ui/layout/sidebar'
import { TopNav } from '@/shared/ui/layout/topnav'

interface Props {
  children: React.ReactNode
}

export function PrivateDashboardLayout({ children }: Props) {
  const location = useLocation()

  return (
    <div className="flex h-screen w-full bg-[var(--color-background)] overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        {/* Contenedor Principal con Transición Suave Suiza */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="w-full min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
export default PrivateDashboardLayout
