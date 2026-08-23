import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SubjectsPagination from '../subjects-pagination'
import SubjectsFilters from '../subjects-filters'

describe('Módulo Subjects - Pruebas Unitarias y de Humo', () => {
  describe('SubjectsPagination', () => {
    it('debe renderizar la paginación correctamente', () => {
      render(
        <SubjectsPagination
          page={1}
          totalPages={5}
          totalItems={45}
          onPageChange={() => {}}
        />
      )

      expect(screen.getByText(/Mostrando página 1 de 5 • Total: 45 registros/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Ir a la página anterior/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Ir a la página siguiente/i })).toBeEnabled()
    })

    it('debe activar el callback al pulsar el botón Siguiente', () => {
      const handlePageChange = vi.fn()
      render(
        <SubjectsPagination
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

  describe('SubjectsFilters', () => {
    it('debe renderizar el input con el valor inicial de búsqueda', () => {
      render(
        <SubjectsFilters
          searchTerm="Matemáticas"
          onSearchChange={() => {}}
          selectedLevel=""
          onLevelChange={() => {}}
          selectedStatus="all"
          onStatusChange={() => {}}
          allowedLevels={['INICIAL', 'PRIMARIA', 'SECUNDARIA']}
          viewMode="table"
          onViewModeChange={() => {}}
        />
      )

      const input = screen.getByPlaceholderText(/BUSCAR MATERIA POR NOMBRE, SIGLA O ÁREA.../i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('Matemáticas')
    })

    it('debe llamar al callback de búsqueda cuando el input cambia de valor', () => {
      const handleSearchChange = vi.fn()
      render(
        <SubjectsFilters
          searchTerm=""
          onSearchChange={handleSearchChange}
          selectedLevel=""
          onLevelChange={() => {}}
          selectedStatus="all"
          onStatusChange={() => {}}
          allowedLevels={['INICIAL', 'PRIMARIA', 'SECUNDARIA']}
          viewMode="table"
          onViewModeChange={() => {}}
        />
      )

      const input = screen.getByPlaceholderText(/BUSCAR MATERIA POR NOMBRE, SIGLA O ÁREA.../i)
      fireEvent.change(input, { target: { value: 'Física' } })

      expect(handleSearchChange).toHaveBeenCalledWith('Física')
    })
  })
})
