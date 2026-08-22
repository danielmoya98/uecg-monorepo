import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AcademicYearsTable } from '../academic-years-ui'
import AcademicYearDrawer from '../academic-year-drawer'
import type { AcademicYearData } from '../../types/academic-years.types'

const mockYears: AcademicYearData[] = [
  {
    id: '1',
    year: 2026,
    name: 'Gestión Académica 2026',
    startDate: '2026-02-01T00:00:00.000Z',
    endDate: '2026-11-30T00:00:00.000Z',
    status: 'ACTIVE',
  },
  {
    id: '2',
    year: 2027,
    name: 'Gestión Académica 2027',
    startDate: '2027-02-01T00:00:00.000Z',
    endDate: '2027-11-30T00:00:00.000Z',
    status: 'PLANNING',
  },
]

describe('Módulo Academic Years - Pruebas Unitarias y de Humo', () => {
  describe('AcademicYearsTable', () => {
    it('debe renderizar la lista de gestiones correctamente', () => {
      render(
        <AcademicYearsTable
          years={mockYears}
          isLoadingData={false}
          onEdit={() => {}}
          onOpenTrimesters={() => {}}
          onDelete={() => {}}
          onStatusChange={() => {}}
          isUpdatingStatus={false}
        />
      )

      expect(screen.getByText('Gestión Académica 2026')).toBeInTheDocument()
      expect(screen.getByText('AÑO: 2026')).toBeInTheDocument()
      expect(screen.getByText('Gestión Académica 2027')).toBeInTheDocument()
      expect(screen.getByText('AÑO: 2027')).toBeInTheDocument()

      expect(screen.getByText('Activa')).toBeInTheDocument()
      expect(screen.getByText('Planificación')).toBeInTheDocument()
    })
  })

  describe('AcademicYearDrawer', () => {
    const mockOnSubmit = vi.fn()
    const mockOnDelete = vi.fn()
    const mockOnClose = vi.fn()

    beforeEach(() => {
      mockOnSubmit.mockClear()
      mockOnDelete.mockClear()
      mockOnClose.mockClear()
    })

    it('debe renderizar el drawer en modo creación con valores por defecto', () => {
      render(
        <AcademicYearDrawer
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onSubmit={mockOnSubmit}
          onDelete={mockOnDelete}
          isSubmitting={false}
        />
      )

      expect(screen.getByRole('heading', { name: /Nueva Gestión/i })).toBeInTheDocument()
      expect(screen.getByLabelText('Año')).toHaveValue(new Date().getFullYear())
      expect(screen.getByLabelText('Nombre Oficial')).toHaveValue(
        `Gestión Académica ${new Date().getFullYear()}`
      )
    })

    it('debe mostrar errores de validación si las fechas están vacías', async () => {
      render(
        <AcademicYearDrawer
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onSubmit={mockOnSubmit}
          onDelete={mockOnDelete}
          isSubmitting={false}
        />
      )

      const saveBtn = screen.getByRole('button', { name: /Guardar Cambios/i })
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(screen.getByText(/Seleccione la fecha de inicio/i)).toBeInTheDocument()
        expect(screen.getByText(/Seleccione la fecha de fin/i)).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('debe llamar a onSubmit con los datos correctos si los campos son válidos', async () => {
      render(
        <AcademicYearDrawer
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onSubmit={mockOnSubmit}
          onDelete={mockOnDelete}
          isSubmitting={false}
        />
      )

      fireEvent.change(screen.getByLabelText('Fecha Inicio'), {
        target: { value: '2026-02-01' },
      })
      fireEvent.change(screen.getByLabelText('Fecha Fin'), {
        target: { value: '2026-11-30' },
      })

      const saveBtn = screen.getByRole('button', { name: /Guardar Cambios/i })
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    it('debe renderizar en modo delete y llamar a onDelete al confirmar', () => {
      const yearToDelete = mockYears[1] // PLANNING state, can be deleted

      render(
        <AcademicYearDrawer
          isOpen={true}
          onClose={mockOnClose}
          mode="delete"
          data={yearToDelete}
          onSubmit={mockOnSubmit}
          onDelete={mockOnDelete}
          isSubmitting={false}
        />
      )

      expect(screen.getByRole('heading', { name: /¿ELIMINAR GESTIÓN\?/i })).toBeInTheDocument()
      expect(screen.getByText(yearToDelete.name)).toBeInTheDocument()

      const deleteBtn = screen.getByRole('button', { name: /Eliminar/i })
      fireEvent.click(deleteBtn)

      expect(mockOnDelete).toHaveBeenCalledWith(yearToDelete.id)
    })
  })
})
