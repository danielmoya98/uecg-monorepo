import { useState } from 'react'
import { Clock, BellRing } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClassPeriodsData } from '../hooks/use-class-periods-data'
import ShiftTabs from './shift-tabs'
import ClassPeriodForm from './class-period-form'
import ClassPeriodsTable from './class-periods-table'
import DeleteClassPeriodDrawer from './delete-class-period-drawer'
import type { ClassPeriod, ClassPeriodPayload } from '../types/class-periods.types'

export default function ClassPeriodsSettingsPanel() {
  const {
    selectedShift,
    setSelectedShift,
    periods,
    isLoading,
    createMutation,
    updateMutation,
    removeMutation,
  } = useClassPeriodsData()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<ClassPeriod | null>(null)
  const [periodToDelete, setPeriodToDelete] = useState<ClassPeriod | null>(null)

  const handleFormSubmit = (data: ClassPeriodPayload) => {
    if (editingPeriod) {
      updateMutation.mutate(
        { id: editingPeriod.id, data },
        {
          onSuccess: () => {
            setIsFormOpen(false)
            setEditingPeriod(null)
          },
        }
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsFormOpen(false)
        },
      })
    }
  }

  const handleEdit = (period: ClassPeriod) => {
    setEditingPeriod(period)
    setIsFormOpen(true)
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingPeriod(null)
  }

  const handleDeletePrompt = (period: ClassPeriod) => {
    setPeriodToDelete(period)
  }

  const handleConfirmDelete = (id: string) => {
    removeMutation.mutate(id, {
      onSuccess: () => {
        setPeriodToDelete(null)
      },
    })
  }

  return (
    <section className="bg-white border border-uecg-line shadow-sm overflow-hidden flex flex-col xl:flex-row relative">
      {/* Panel Lateral Informativo */}
      <div className="bg-uecg-dark text-white p-8 xl:w-[35%] flex flex-col justify-between shrink-0 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 border-[8px] border-white opacity-5 rounded-none rotate-45 pointer-events-none" />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-uecg-blue text-white flex items-center justify-center shadow-sm mb-6">
            <BellRing className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 leading-none">
            El Campanario
          </h2>
          <p className="text-[10px] font-bold tracking-widest uppercase text-blue-200/80 leading-relaxed mt-3">
            Configure los bloques de tiempo.
          </p>
        </div>
      </div>

      {/* Panel de Contenido y Configuración */}
      <div className="p-8 flex-1 bg-white flex flex-col">
        {/* Pestañas de Turno */}
        <ShiftTabs
          selectedShift={selectedShift}
          onShiftChange={(shift) => {
            setSelectedShift(shift)
            setIsFormOpen(false)
            setEditingPeriod(null)
          }}
        />

        {/* Encabezado de Estructura de Turno */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-uecg-gray flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Estructura del Turno
          </h3>
          <button
            type="button"
            onClick={() => {
              if (isFormOpen) {
                handleCancelForm()
              } else {
                setEditingPeriod(null)
                setIsFormOpen(true)
              }
            }}
            className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 outline-none shadow-sm cursor-pointer ${
              isFormOpen
                ? 'bg-uecg-gray text-white hover:bg-uecg-text'
                : 'bg-uecg-blue text-white hover:bg-uecg-dark'
            }`}
          >
            {isFormOpen ? 'Cerrar Editor' : 'Añadir Bloque'}
          </button>
        </div>

        {/* Formulario Animado */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <ClassPeriodForm
                initialData={editingPeriod}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelForm}
                isPending={createMutation.isPending || updateMutation.isPending}
                defaultOrder={(periods?.length || 0) + 1}
                selectedShift={selectedShift}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabla de Periodos */}
        <ClassPeriodsTable
          periods={periods}
          isLoading={isLoading}
          isDeleting={removeMutation.isPending}
          onEdit={handleEdit}
          onDelete={handleDeletePrompt}
        />

        {/* Modal Accesible de Confirmación de Eliminación */}
        <DeleteClassPeriodDrawer
          isOpen={!!periodToDelete}
          onClose={() => setPeriodToDelete(null)}
          period={periodToDelete}
          onConfirm={handleConfirmDelete}
          isDeleting={removeMutation.isPending}
        />
      </div>
    </section>
  )
}

