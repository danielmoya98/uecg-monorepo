import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AttendanceHeader } from '../attendance-header'

// Mock de framer-motion para evitar errores de animación en entorno de pruebas
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; layoutId?: string }) => {
      const domProps = { ...props }
      delete domProps.layoutId
      return <div {...domProps}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Módulo Asistencia - Pruebas Unitarias y de Humo', () => {
  describe('AttendanceHeader', () => {
    it('debe renderizar el título de la página y las pestañas principales', () => {
      render(
        <AttendanceHeader
          activeTab="monitor"
          setActiveTab={() => {}}
          canJustify={true}
        />
      )

      expect(screen.getByText(/Gestión de Asistencia/i)).toBeInTheDocument()
      expect(screen.getByText(/Control Central/i)).toBeInTheDocument()
      expect(screen.getByText(/Monitor en Vivo/i)).toBeInTheDocument()
      expect(screen.getByText(/Estación QR/i)).toBeInTheDocument()
      expect(screen.getByText(/Licencias \/ Justificar/i)).toBeInTheDocument()
    })

    it('debe ocultar la pestaña de licencias si el usuario no tiene permisos de justificación', () => {
      render(
        <AttendanceHeader
          activeTab="monitor"
          setActiveTab={() => {}}
          canJustify={false}
        />
      )

      expect(screen.getByText(/Monitor en Vivo/i)).toBeInTheDocument()
      expect(screen.getByText(/Estación QR/i)).toBeInTheDocument()
      expect(screen.queryByText(/Licencias \/ Justificar/i)).not.toBeInTheDocument()
    })

    it('debe detonar la acción de cambiar de pestaña al hacer click en el botón correspondiente', () => {
      const handleTabChange = vi.fn()
      render(
        <AttendanceHeader
          activeTab="monitor"
          setActiveTab={handleTabChange}
          canJustify={true}
        />
      )

      const scannerTabButton = screen.getByText(/Estación QR/i)
      fireEvent.click(scannerTabButton)

      expect(handleTabChange).toHaveBeenCalledWith('scanner')
    })
  })
})
