import { useEffect } from 'react'
import { Loader2, Download, ScanLine, AlertTriangle, KeySquare } from 'lucide-react'
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import { DrawerShell } from '@/shared/ui/drawer-shell'
import { StudentCarnetDocument } from './student-carnet-document'
import type { Enrollment, QRAccessResult } from '../types/identity.types'


interface StudentCarnetDrawerProps {
  isOpen: boolean
  onClose: () => void
  enrollment: Enrollment | null
  qrData: QRAccessResult | null
  isLoadingQr: boolean
  isGenerating: boolean
  isRevoking: boolean
  onGenerate: () => void
  onRevoke: () => void
  canManageIdentity: boolean
}

export const StudentCarnetDrawer = ({
  isOpen,
  onClose,
  enrollment,
  qrData,
  isLoadingQr,
  isGenerating,
  isRevoking,
  onGenerate,
  onRevoke,
  canManageIdentity,
}: StudentCarnetDrawerProps) => {

  // Cerrar al pulsar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !enrollment) return null

  const isQrActive = qrData?.isActive || false
  const finalQrBase64 = qrData?.qr || ''

  const handleRevokeConfirm = () => {
    if (
      confirm(
        '¿Estás seguro de revocar este carnet? El alumno no podrá ingresar hasta que emitas uno nuevo.'
      )
    ) {
      onRevoke()
    }
  }

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title="Carnet de Estudiante"
      kicker="Identidad Digital"
      icon={<ScanLine className="w-5 h-5 text-white" />}
      headerVariant="dark"
      isSubmitting={isGenerating || isRevoking}
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col h-full">

        {/* Contenido principal */}
        <div className="flex-1 p-6 overflow-hidden bg-gray-50 flex flex-col relative" tabIndex={0}>
          {isLoadingQr ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-uecg-gray gap-4 z-10 bg-white/90">
              <Loader2 className="w-10 h-10 animate-spin text-uecg-blue" />
              <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
                Consultando registro de identidad...
              </span>
            </div>
          ) : isQrActive ? (
            <div className="flex-1 border border-uecg-line shadow-md overflow-hidden bg-white animate-in fade-in zoom-in-95 duration-300">
              <PDFViewer width="100%" height="100%" className="border-none">
                <StudentCarnetDocument
                  student={enrollment.student}
                  enrollment={enrollment}
                  qrBase64={finalQrBase64}
                />
              </PDFViewer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-white border border-dashed border-uecg-line shadow-sm animate-in fade-in">
              <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-none flex items-center justify-center mb-5 rotate-12">
                <KeySquare className="w-8 h-8 text-gray-400 -rotate-12" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-uecg-dark mb-2">
                Sin Acceso Autorizado
              </h3>
              <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed mb-8 max-w-[250px]">
                Este estudiante no tiene una identidad digital activa o su carnet anterior fue revocado
                por seguridad.
              </p>

              {canManageIdentity ? (
                <button
                  onClick={onGenerate}
                  disabled={isGenerating}
                  type="button"
                  className="px-6 py-4 bg-uecg-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-uecg-dark transition-colors flex items-center gap-2 shadow-sm outline-none cursor-pointer"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ScanLine className="w-4 h-4" />
                  )}
                  Generar Nueva Identidad Criptográfica
                </button>
              ) : (
                <p className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 p-3 uppercase tracking-widest">
                  COMUNÍQUESE CON DIRECCIÓN PARA GENERAR EL CARNET.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer del Drawer */}
        <footer className="p-5 border-t border-uecg-line bg-gray-50 flex gap-3 shrink-0">
          {isQrActive && canManageIdentity && (
            <button
              onClick={handleRevokeConfirm}
              disabled={isRevoking || isLoadingQr}
              type="button"
              title="Inutiliza el QR actual (Ej. en caso de pérdida)"
              className="w-14 shrink-0 py-3 border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors flex justify-center items-center disabled:opacity-50 shadow-sm outline-none cursor-pointer"
            >
              {isRevoking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            onClick={onClose}
            type="button"
            className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-uecg-line bg-white hover:bg-gray-100 text-uecg-gray transition-colors shadow-sm outline-none cursor-pointer"
          >
            {isQrActive ? 'Cerrar Panel' : 'Cancelar'}
          </button>

          {isQrActive && finalQrBase64 && (
            <PDFDownloadLink
              document={
                <StudentCarnetDocument
                  student={enrollment.student}
                  enrollment={enrollment}
                  qrBase64={finalQrBase64}
                />
              }
              fileName={`Carnet_${enrollment.student.ci || enrollment.student.id}.pdf`}
              className="flex-[2] py-3 text-[10px] font-black uppercase tracking-widest bg-uecg-dark text-white hover:bg-black transition-colors flex justify-center items-center gap-2 shadow-sm outline-none cursor-pointer"
            >
              {({ loading }) =>
                loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Compilando...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Descargar PDF
                  </>
                )
              }
            </PDFDownloadLink>
          )}
        </footer>
      </div>
    </DrawerShell>
  )
}
export default StudentCarnetDrawer

