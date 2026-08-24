import { Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAttendanceWorkspace } from '../hooks/use-attendance-workspace'
import { useAttendanceData } from '../hooks/use-attendance-data'
import { AttendanceHeader } from './attendance-header'
import { BlockSelector } from './block-selector'
import { AttendanceMonitor } from './attendance-monitor'
import { QRScannerView } from './qr-scanner-view'
import { JustificationsPanel } from './justifications-panel'

export default function AttendancePage() {
  const {
    activeTab,
    setActiveTab,
    selectedBlock,
    setSelectedBlock,
    canJustify,
    isPowerUser,
  } = useAttendanceWorkspace()

  const { settings, loadingSettings, dailyBlocks, isLoadingBlocks } = useAttendanceData()

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-300">
      <AttendanceHeader

        activeTab={activeTab}
        setActiveTab={setActiveTab}
        canJustify={canJustify}
      />

      {/* SELECCIÓN DE BLOQUE (Se oculta en licencias) */}
      <AnimatePresence mode="wait">
        {activeTab !== 'justifications' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <BlockSelector
              dailyBlocks={dailyBlocks}
              isLoadingBlocks={isLoadingBlocks}
              selectedBlock={selectedBlock}
              setSelectedBlock={setSelectedBlock}
              isPowerUser={isPowerUser}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDERIZADO DEL CONTENIDO BASADO EN TABS Y BLOQUES */}
      <div className="mt-2 relative z-10">
        {activeTab !== 'justifications' && !selectedBlock ? (
          <div className="text-center p-16 border-2 border-dashed border-uecg-line bg-white shadow-sm flex flex-col items-center justify-center min-h-[350px] select-none animate-in fade-in duration-350">
            <Clock className="w-16 h-16 text-uecg-gray opacity-30 mb-4" />
            <h3 className="text-lg font-black uppercase tracking-widest text-uecg-dark">
              Pizarra de Control
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-uecg-gray mt-2 max-w-xs">
              Seleccione un bloque de clases en el panel superior para comenzar el pase de lista.
            </p>
          </div>
        ) : (
          <div className="relative">
            {activeTab === 'monitor' && selectedBlock && (
              <AttendanceMonitor
                classroomId={selectedBlock.classroomId}
                classPeriodId={selectedBlock.classPeriodIds[0]}
                allClassPeriodIds={selectedBlock.classPeriodIds}
              />
            )}

            {activeTab === 'scanner' && selectedBlock && (
              <QRScannerView
                loadingSettings={loadingSettings}
                settings={settings}
                selectedBlock={selectedBlock}
              />
            )}
          </div>
        )}

        {/* Justificaciones (Independiente de los bloques) */}
        <AnimatePresence>
          {activeTab === 'justifications' && canJustify && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
            >
              <JustificationsPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
