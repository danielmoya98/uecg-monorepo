import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import StudentsPagination from '../StudentsPagination'
import StudentsFilters from '../StudentsFilters'
import { StudentsHeader } from '../StudentsHeader'

// Mock de @tanstack/react-router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => (
    <a href={to} data-testid="mock-link">{children}</a>
  )
}))

describe('Módulo Students - Pruebas Unitarias y de Humo', () => {
  describe('StudentsPagination', () => {
    it('debe renderizar la paginación correctamente', () => {
      render(
        <StudentsPagination
          page={1}
          totalPages={5}
          totalItems={45}
          onPageChange={() => {}}
        />
      )

      expect(screen.getByText(/Mostrando página 1 de 5/i)).toBeInTheDocument()
      expect(screen.getByText(/Total: 45 estudiantes/i)).toBeInTheDocument()
      
      const prevButton = screen.getByRole('button', { name: /Anterior/i })
      const nextButton = screen.getByRole('button', { name: /Siguiente/i })
      
      expect(prevButton).toBeDisabled()
      expect(nextButton).toBeEnabled()
    })

    it('debe activar el callback al pulsar el botón Siguiente', () => {
      const handlePageChange = vi.fn()
      render(
        <StudentsPagination
          page={1}
          totalPages={5}
          totalItems={45}
          onPageChange={handlePageChange}
        />
      )

      const nextButton = screen.getByRole('button', { name: /Siguiente/i })
      fireEvent.click(nextButton)

      expect(handlePageChange).toHaveBeenCalledWith(2)
    })
  })

  describe('StudentsFilters', () => {
    const defaultProps = {
      searchTerm: "",
      onSearchChange: () => {},
      levelFilter: "",
      onLevelChange: () => {},
      classroomFilter: "",
      onClassroomChange: () => {},
      statusFilter: "",
      onStatusChange: () => {},
      allowedLevels: ["PRIMARIA", "SECUNDARIA"],
      availableClassrooms: [
        { id: "1", level: "SECUNDARIA", grade: "1", section: "A" },
        { id: "2", level: "SECUNDARIA", grade: "2", section: "B" }
      ],
      viewMode: "table" as const,
      onViewModeChange: () => {}
    }

    it('debe renderizar el input con el valor inicial de búsqueda', () => {
      render(
        <StudentsFilters
          {...defaultProps}
          searchTerm="CARLOS"
        />
      )

      const input = screen.getByPlaceholderText(/BUSCAR ESTUDIANTE/i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('CARLOS')
    })

    it('debe llamar al callback de búsqueda cuando el input cambia de valor', () => {
      const handleSearchChange = vi.fn()
      render(
        <StudentsFilters
          {...defaultProps}
          onSearchChange={handleSearchChange}
        />
      )

      const input = screen.getByPlaceholderText(/BUSCAR ESTUDIANTE/i)
      fireEvent.change(input, { target: { value: 'MARIA' } })

      expect(handleSearchChange).toHaveBeenCalledWith('MARIA')
    })
  })

  describe('StudentsHeader', () => {
    it('debe renderizar el título correctamente y los botones de acción', () => {
      const handleOpenMassiveExport = vi.fn()
      render(
        <StudentsHeader
          currentYearName="2026"
          canCreateStudent={true}
          canDownloadReports={true}
          isLoaded={true}
          isFetching={false}
          isPending={false}
          onOpenMassiveExport={handleOpenMassiveExport}
        />
      )

      expect(screen.getByText('Población Escolar')).toBeInTheDocument()
      expect(screen.getByText('Gestión 2026')).toBeInTheDocument()
      
      const massiveBtn = screen.getByRole('button', { name: /Libreta por Curso/i })
      expect(massiveBtn).toBeInTheDocument()
      
      fireEvent.click(massiveBtn)
      expect(handleOpenMassiveExport).toHaveBeenCalledTimes(1)
    })
  })
})
