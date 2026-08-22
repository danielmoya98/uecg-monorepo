import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import UsersPagination from '../users-pagination'
import UsersFilters from '../users-filters'

describe('Módulo Users - Pruebas Unitarias y de Humo', () => {
  describe('UsersPagination', () => {
    it('debe renderizar la paginación correctamente', () => {
      render(
        <UsersPagination
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
        <UsersPagination
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

  describe('UsersFilters', () => {
    it('debe renderizar el input con el valor inicial de búsqueda', () => {
      render(
        <UsersFilters
          searchTerm="Carlos"
          onSearchChange={() => {}}
          filterRole="Todos"
          onRoleChange={() => {}}
          viewMode="table"
          onViewModeChange={() => {}}
        />
      )

      const input = screen.getByPlaceholderText(/BUSCAR POR NOMBRE O CORREO EN EL SERVIDOR.../i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('Carlos')
    })

    it('debe llamar al callback de búsqueda cuando el input cambia de valor', () => {
      const handleSearchChange = vi.fn()
      render(
        <UsersFilters
          searchTerm=""
          onSearchChange={handleSearchChange}
          filterRole="Todos"
          onRoleChange={() => {}}
          viewMode="table"
          onViewModeChange={() => {}}
        />
      )

      const input = screen.getByPlaceholderText(/BUSCAR POR NOMBRE O CORREO EN EL SERVIDOR.../i)
      fireEvent.change(input, { target: { value: 'Mendoza' } })

      expect(handleSearchChange).toHaveBeenCalledWith('Mendoza')
    })
  })
})
