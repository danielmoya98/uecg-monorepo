import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { IdentityService } from '../api/identity.service'
import { useSocket } from '../providers/socket-provider'
import { api } from '@/shared/api/client'
import type { ExportReadyPayload } from '../types/identity.types'

export const useIdentityExport = (currentYearId?: string) => {
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const socket = useSocket()

  useEffect(() => {
    if (!currentYearId || !socket) return

    const eventName = `carnets-ready-${currentYearId}`
    socket.off(eventName)

    const handleExportReady = (data: ExportReadyPayload) => {
      setIsExporting(false)

      toast.success('¡Lote de Carnets Generado!', {
        duration: Infinity,
        description: 'El archivo comprimido está listo para imprenta.',
        action: {
          label: 'Descargar ZIP',
          onClick: async () => {
            const loadingToast = toast.loading('Descargando Carnets...', {
              description: 'Obteniendo archivo binario...',
            })
            try {
              const response = await api.get(
                `/identity/export/zip/download/${data.fileName}`,
                {
                  responseType: 'blob',
                }
              )

              const url = window.URL.createObjectURL(new Blob([response.data]))
              const link = document.createElement('a')
              link.href = url
              link.setAttribute('download', data.fileName)
              document.body.appendChild(link)
              link.click()
              if (link.parentNode) {
                link.parentNode.removeChild(link)
              }
              window.URL.revokeObjectURL(url)

              toast.success('Descarga completada', { id: loadingToast })
            } catch (error) {
              console.error('Error descargando ZIP:', error)
              toast.error('Error de autorización al descargar', { id: loadingToast })
            }
          },
        },
      })
    }

    socket.on(eventName, handleExportReady)

    return () => {
      socket.off(eventName, handleExportReady)
    }
  }, [currentYearId, socket])

  const handleMassExport = async (levelFilter: string, classroomFilter: string) => {
    if (!currentYearId) {
      toast.error('Error: No se ha seleccionado una gestión académica.')
      return
    }
    setIsExporting(true)
    toast.info('Generando Carnets...', {
      description: 'Los PDFs con QRs únicos se están compilando en el servidor.',
    })

    try {
      await IdentityService.exportMassive(currentYearId, {
        level: levelFilter || undefined,
        classroomId: classroomFilter || undefined,
      })
    } catch (error) {
      console.error('Error al solicitar exportación masiva:', error)
      toast.error('Error al iniciar la exportación masiva')
      setIsExporting(false)
    }
  }

  return { isExporting, handleMassExport }
}
