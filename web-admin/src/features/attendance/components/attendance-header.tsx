import { ClipboardCheck, Users, QrCode, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import type { AttendanceTab } from '../hooks/use-attendance-workspace'

interface AttendanceHeaderProps {
  activeTab: AttendanceTab
  setActiveTab: (tab: AttendanceTab) => void
  canJustify: boolean
}

export const AttendanceHeader = ({
  activeTab,
  setActiveTab,
  canJustify,
}: AttendanceHeaderProps) => {
  const tabs = [
    { id: 'monitor' as const, label: 'Monitor en Vivo', icon: Users },
    { id: 'scanner' as const, label: 'Estación QR', icon: QrCode },
    ...(canJustify
      ? [{ id: 'justifications' as const, label: 'Licencias / Justificar', icon: UserCheck }]
      : []),
  ]

  return (
    <>
      <header className="border-b border-uecg-line pb-4 mt-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray bg-gray-100 px-2 py-0.5 border border-uecg-line select-none">
          Control Central
        </span>
        <h1 className="text-4xl mt-2 font-black tracking-tighter uppercase text-uecg-dark flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-uecg-blue" strokeWidth={3} />
          Gestión de Asistencia
        </h1>
      </header>

      <div className="flex border-b border-uecg-line overflow-x-auto bg-gray-50/50 p-1 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-6 py-4 font-black uppercase tracking-widest text-[11px] transition-colors whitespace-nowrap outline-none cursor-pointer ${
                isActive ? 'text-uecg-blue' : 'text-uecg-gray hover:text-uecg-dark'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeAttendanceTab"
                  className="absolute inset-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-b-2 border-uecg-blue"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" /> {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}
