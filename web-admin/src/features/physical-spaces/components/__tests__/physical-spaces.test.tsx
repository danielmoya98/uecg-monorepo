import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PhysicalSpacesFilters from '../physical-spaces-filters'
import { PhysicalSpacesHeader } from '../physical-spaces-header'

describe('Módulo Physical Spaces - Pruebas Unitarias y de Humo', () => {
  describe('PhysicalSpacesFilters', () => {
    it('debe renderizar el input con el valor inicial de búsqueda', () => {
      render(
        <PhysicalSpacesFilters
          searchTerm="Aula Magna"
          onSearchChange={() => {}}
          selectedType=""
          onTypeChange={() => {}}
          viewMode="table"
          onViewModeChange={() => {}}
        />
      )

      const input = screen.getByPlaceholderText(/Buscar por nombre... \(Ctrl\+K\)/i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('Aula Magna')
    })

    it('debe llamar al callback de búsqueda cuando el input cambia de valor', () => {
      const handleSearchChange = vi.fn()
      render(
        <PhysicalSpacesFilters
          searchTerm=""
          onSearchChange={handleSearchChange}
          selectedType=""
          onTypeChange={() => {}}
          viewMode="table"
          onViewModeChange={() => {}}
        />
      )

      const input = screen.getByPlaceholderText(/Buscar por nombre... \(Ctrl\+K\)/i)
      fireEvent.change(input, { target: { value: 'Laboratorio' } })

      expect(handleSearchChange).toHaveBeenCalledWith('Laboratorio')
    })

    it('debe activar el callback al pulsar los botones de cambio de vista', () => {
      const handleViewModeChange = vi.fn()
      render(
        <PhysicalSpacesFilters
          searchTerm=""
          onSearchChange={() => {}}
          selectedType=""
          onTypeChange={() => {}}
          viewMode="table"
          onViewModeChange={handleViewModeChange}
        />
      )

      const gridButton = screen.getByLabelText(/Vista de Cuadrícula/i)
      fireEvent.click(gridButton)

      expect(handleViewModeChange).toHaveBeenCalledWith('grid')
    })

    it('debe renderizar e interactuar con el componente de selección suizo', () => {
      const handleTypeChange = vi.fn()
      render(
        <PhysicalSpacesFilters
          searchTerm=""
          onSearchChange={() => {}}
          selectedType="SALON"
          onTypeChange={handleTypeChange}
          viewMode="table"
          onViewModeChange={() => {}}
        />
      )

      // El botón debe mostrar la etiqueta seleccionada
      const selectButton = screen.getByRole('button', { name: /SALÓN REGULAR/i })
      expect(selectButton).toBeInTheDocument()

      // Hacemos clic para abrir el listado
      fireEvent.click(selectButton)

      // Seleccionamos la categoría de laboratorios
      const labButton = screen.getByRole('button', { name: /LABORATORIOS/i })
      expect(labButton).toBeInTheDocument()
      fireEvent.click(labButton)

      expect(handleTypeChange).toHaveBeenCalledWith('LABORATORIO')
    })
  })

  describe('PhysicalSpacesHeader', () => {
    it('debe renderizar el título del módulo', () => {
      render(
        <PhysicalSpacesHeader
          canManageSpaces={false}
          onOpenCreate={() => {}}
        />
      )

      expect(screen.getByText('Espacios Físicos')).toBeInTheDocument()
      expect(screen.getByText('Infraestructura')).toBeInTheDocument()
    })

    it('debe renderizar el botón de registro si tiene permisos y llamar al callback', () => {
      const handleOpenCreate = vi.fn()
      render(
        <PhysicalSpacesHeader
          canManageSpaces={true}
          onOpenCreate={handleOpenCreate}
        />
      )

      const registerButton = screen.getByRole('button', { name: /Registrar Espacio/i })
      expect(registerButton).toBeInTheDocument()

      fireEvent.click(registerButton)
      expect(handleOpenCreate).toHaveBeenCalled()
    })

    it('no debe renderizar el botón de registro si carece de permisos', () => {
      render(
        <PhysicalSpacesHeader
          canManageSpaces={false}
          onOpenCreate={() => {}}
        />
      )

      const registerButton = screen.queryByRole('button', { name: /Registrar Espacio/i })
      expect(registerButton).not.toBeInTheDocument()
    })
  })
})
