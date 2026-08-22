import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ClassroomCard } from '../classroom-card'
import { ClassroomsSkeleton } from '../classrooms-skeleton'
import type { Classroom } from '@/features/classrooms/types/classrooms.types'

const mockClassroom: Classroom = {
  id: 'classroom-1',
  level: 'SECUNDARIA',
  shift: 'MANANA',
  grade: 'Quinto',
  section: 'B',
  capacity: 35,
  advisor: {
    id: 'teacher-1',
    fullName: 'Juan Perez',
  },
  academicYear: {
    id: 'year-2026',
    name: 'Gestión 2026',
    status: 'ACTIVE',
  },
  baseRoom: {
    id: 'room-101',
    name: 'Aula 101',
  },
}

describe('Módulo Timetables - Pruebas Unitarias y de Humo', () => {
  describe('ClassroomCard', () => {
    it('debe renderizar los datos del aula correctamente', () => {
      render(
        <ClassroomCard
          classroom={mockClassroom}
          onClick={() => {}}
          canManage={false}
        />
      )

      expect(screen.getByText(/Turno MANANA/i)).toBeInTheDocument()
      expect(screen.getByText(/Quinto "B"/i)).toBeInTheDocument()
      expect(screen.getByText(/Nivel SECUNDARIA/i)).toBeInTheDocument()
      expect(screen.getByText(/Ver Horario/i)).toBeInTheDocument()
    })

    it('debe renderizar el texto Abrir Editor si el usuario gestiona horarios', () => {
      render(
        <ClassroomCard
          classroom={mockClassroom}
          onClick={() => {}}
          canManage={true}
        />
      )

      expect(screen.getByText(/Abrir Editor/i)).toBeInTheDocument()
    })

    it('debe disparar el callback onClick cuando se pulsa sobre la tarjeta', () => {
      const handleClick = vi.fn()
      render(
        <ClassroomCard
          classroom={mockClassroom}
          onClick={handleClick}
          canManage={false}
        />
      )

      const cardButton = screen.getByRole('button', {
        name: /Ver horario de Quinto grado, sección B, nivel SECUNDARIA/i,
      })
      fireEvent.click(cardButton)

      expect(handleClick).toHaveBeenCalledWith(mockClassroom)
    })
  })

  describe('ClassroomsSkeleton', () => {
    it('debe renderizar la cantidad correcta de marcadores de carga', () => {
      render(<ClassroomsSkeleton />)

      const loaderContainer = screen.getByRole('status', { name: /Cargando aulas.../i })
      expect(loaderContainer).toBeInTheDocument()
      expect(loaderContainer.children.length).toBe(8)
    })
  })
})
