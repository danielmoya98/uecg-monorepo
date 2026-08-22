import React from 'react'
import { Sidebar } from '@/shared/ui/layout/sidebar'
import { TopNav } from '@/shared/ui/layout/topnav'

interface Props {
  children: React.ReactNode
}

export function PrivateDashboardLayout({ children }: Props) {
  return (
    <div className="flex h-screen w-full bg-[var(--color-background)] overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        {/* 🔥 AQUÍ DEBE INYECTARSE EL CONTENIDO */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
