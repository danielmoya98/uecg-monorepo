import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useSocket } from '@/features/identity'
import { api } from '@/shared/api/client'

interface ExportReadyPayload {
  message: string
  fileName: string
}

export function useTimetableExport(academicYearId?: string) {
  const [isExporting, setIsExporting] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const socket = useSocket()

  useEffect(() => {
    if (!academicYearId || !socket) return

    const eventName = `export-ready-${academicYearId}`
    socket.off(eventName)

    const handleExportReady = (data: ExportReadyPayload) => {
      setIsExporting(false)

      toast.success('¡Lote Maestro de Horarios Generado!', {
        duration: Infinity,
        description: 'La matriz completa de horarios está lista en ZIP.',
        action: {
          label: 'Descargar ZIP',
          onClick: async () => {
            const downloadToast = toast.loading('Descargando ZIP...', {
              description: 'Obteniendo archivo binario del servidor...',
            })
            try {
              const response = await api.get(`/timetables/export/zip/download/${data.fileName}`, {
                responseType: 'blob',
              })

              const blob = new Blob([response.data], { type: 'application/zip' })
              const url = window.URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.setAttribute('download', data.fileName)
              document.body.appendChild(link)
              link.click()
              link.parentNode?.removeChild(link)
              window.URL.revokeObjectURL(url)

              toast.success('Descarga completada con éxito', { id: downloadToast })
            } catch {
              toast.error('Error de autorización o red al descargar el archivo', {
                id: downloadToast,
              })
            }
          },
        },
      })
    }

    socket.on(eventName, handleExportReady)

    return () => {
      socket.off(eventName, handleExportReady)
    }
  }, [academicYearId, socket])

  /**
   * Encolar exportación masiva (ZIP) de la Gestión Académica actual (asíncrona)
   */
  const handleStartExport = async () => {
    if (!academicYearId) return

    setIsExporting(true)
    toast.info('Generando lote maestro de horarios...', {
      description: 'Los PDFs por aulas se están compilando en el servidor.',
    })

    try {
      await api.post(`/timetables/export/zip/start/${academicYearId}`)
    } catch {
      toast.error('Error al solicitar la generación de la exportación masiva.')
      setIsExporting(false)
    }
  }

  /**
   * Descarga de PDF individual de forma directa
   */
  const handleDownloadIndividualPDF = async (
    classroomId: string,
    grade: string,
    section: string,
    level: string
  ) => {
    if (!classroomId) return

    const loadingToast = toast.loading('Generando PDF...', {
      description: 'Compilando visualización oficial de horarios...',
    })
    setIsDownloadingPdf(true)

    try {
      const response = await api.get(`/timetables/export/pdf/${classroomId}`, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Horario_${grade}_${section}_${level}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('PDF descargado exitosamente.', { id: loadingToast })
    } catch {
      toast.error('Error al generar PDF del aula.', { id: loadingToast })
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  return {
    isExporting,
    isDownloadingPdf,
    handleStartExport,
    handleDownloadIndividualPDF,
  }
}
