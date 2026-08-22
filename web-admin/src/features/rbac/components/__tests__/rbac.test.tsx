import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { RbacHeader, RbacRestrictedAlert } from '../rbac-header'
import RbacFilters from '../rbac-filters'

describe('Módulo RBAC - Pruebas Unitarias y de Humo', () => {
  describe('RbacHeader', () => {
    it('debe renderizar el título correctamente', () => {
      render(<RbacHeader onOpenCreate={() => {}} />)
      
      const title = screen.getByText('Gestión de Roles')
      expect(title).toBeInTheDocument()
      expect(screen.getByText('Seguridad y Políticas Globales')).toBeInTheDocument()
    })

    it('debe activar el callback al pulsar el botón "Nuevo Rol"', () => {
      const handleOpenCreate = vi.fn()
      render(<RbacHeader onOpenCreate={handleOpenCreate} />)
      
      const button = screen.getByRole('button', { name: /Crear nuevo perfil de acceso/i })
      fireEvent.click(button)
      
      expect(handleOpenCreate).toHaveBeenCalledTimes(1)
    })
  })

  describe('RbacRestrictedAlert', () => {
    it('debe renderizar el panel de acceso restringido con texto explicativo', () => {
      render(<RbacRestrictedAlert />)
      
      expect(screen.getByText('Acceso Restringido')).toBeInTheDocument()
      expect(screen.getByText(/No cuentas con credenciales de Super Administrador/i)).toBeInTheDocument()
    })
  })

  describe('RbacFilters', () => {
    it('debe renderizar el input con el valor inicial de búsqueda', () => {
      render(
        <RbacFilters
          searchTerm="PSICOLOGO"
          onSearchChange={() => {}}
          viewMode="table"
          onViewModeChange={() => {}}
        />
      )
      
      const input = screen.getByRole('textbox', { name: /Buscar roles/i })
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('PSICOLOGO')
    })

    it('debe llamar al callback de búsqueda cuando el input cambia de valor', () => {
      const handleSearchChange = vi.fn()
      render(
        <RbacFilters
          searchTerm=""
          onSearchChange={handleSearchChange}
          viewMode="table"
          onViewModeChange={() => {}}
        />
      )
      
      const input = screen.getByRole('textbox', { name: /Buscar roles/i })
      fireEvent.change(input, { target: { value: 'DIRECTOR' } })
      
      expect(handleSearchChange).toHaveBeenCalledWith('DIRECTOR')
    })
  })
})
