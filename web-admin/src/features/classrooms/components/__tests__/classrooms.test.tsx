import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ClassroomsPagination } from '../classrooms-pagination'
import { ClassroomsFilters } from '../classrooms-filters'

describe('Módulo Classrooms - Pruebas Unitarias y de Humo', () => {
  describe('ClassroomsPagination', () => {
    it('debe renderizar la paginación correctamente', () => {
      render(
        <ClassroomsPagination
          page={1}
          totalPages={5}
          totalItems={45}
          onPageChange={() => {}}
        />
      )

      expect(screen.getByText(/Mostrando/i)).toBeInTheDocument()
      expect(screen.getByText(/1-10/i)).toBeInTheDocument()
      expect(screen.getAllByText(/de/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/45/i)).toBeInTheDocument()
      expect(screen.getByText(/aulas registradas/i)).toBeInTheDocument()
      
      expect(screen.getByRole('button', { name: /Ir a la página anterior/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Ir a la página siguiente/i })).toBeEnabled()
    })

    it('debe activar el callback al pulsar el botón Siguiente', () => {
      const handlePageChange = vi.fn()
      render(
        <ClassroomsPagination
          page={1}
          totalPages={5}
          totalItems={45}
          onPageChange={handlePageChange}
        />
      )

      const nextButton = screen.getByRole('button', { name: /Ir a la página siguiente/i })
      fireEvent.click(nextButton)

      expect(handlePageChange).toHaveBeenCalledWith(2)
    })
  })

  describe('ClassroomsFilters', () => {
    it('debe renderizar el input con el valor inicial de búsqueda', () => {
      render(
        <ClassroomsFilters
          searchTerm="Quinto"
          onSearchChange={() => {}}
          level=""
          onLevelChange={() => {}}
          shift=""
          onShiftChange={() => {}}
          allowedLevels={['SECUNDARIA']}
          allowedShifts={['MANANA']}
          viewMode="table"
          onViewModeChange={() => {}}
        />
      )

      const input = screen.getByPlaceholderText(/BUSCAR CURSOS POR GRADO.../i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('Quinto')
    })

    it('debe llamar al callback de búsqueda cuando el input cambia de valor', () => {
      const handleSearchChange = vi.fn()
      render(
        <ClassroomsFilters
          searchTerm=""
          onSearchChange={handleSearchChange}
          level=""
          onLevelChange={() => {}}
          shift=""
          onShiftChange={() => {}}
          allowedLevels={['SECUNDARIA']}
          allowedShifts={['MANANA']}
          viewMode="table"
          onViewModeChange={() => {}}
        />
      )

      const input = screen.getByPlaceholderText(/BUSCAR CURSOS POR GRADO.../i)
      fireEvent.change(input, { target: { value: 'Primero' } })

      expect(handleSearchChange).toHaveBeenCalledWith('Primero')
    })
  })
})
