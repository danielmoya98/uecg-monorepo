import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ClassroomSelector } from '../classroom-selector'
import { AssignmentsTable } from '../assignments-table'
import type { Classroom } from '@/features/classrooms/types/classrooms.types'
import type { TeacherAssignment } from '../../types/teacher-assignments.types'

const mockClassrooms: Classroom[] = [
  {
    id: 'c1',
    level: 'SECUNDARIA',
    shift: 'MANANA',
    grade: 'Primero',
    section: 'A',
    capacity: 35,
    advisor: null,
    academicYear: null,
    baseRoom: null,
  },
  {
    id: 'c2',
    level: 'PRIMARIA',
    shift: 'TARDE',
    grade: 'Segundo',
    section: 'B',
    capacity: 30,
    advisor: null,
    academicYear: null,
    baseRoom: null,
  },
]

const mockAssignments: TeacherAssignment[] = [
  {
    id: 'a1',
    classroom: mockClassrooms[0],
    subject: {
      id: 's1',
      name: 'Matemática',
      level: 'SECUNDARIA',
    },
    teacher: {
      id: 't1',
      fullName: 'Juan Perez',
    },
  },
]

describe('Módulo Teacher Assignments - Pruebas Unitarias', () => {
  describe('ClassroomSelector', () => {
    it('debe renderizar la lista de cursos correctamente', () => {
      render(
        <ClassroomSelector
          classrooms={mockClassrooms}
          selectedId="c1"
          onSelect={() => {}}
          isFixedBaseMode={false}
        />
      )

      expect(screen.getByText(/Primero/i)).toBeInTheDocument()
      expect(screen.getByText(/Segundo/i)).toBeInTheDocument()
      expect(screen.getByText(/SECUNDARIA • MANANA/i)).toBeInTheDocument()
      expect(screen.getByText(/PRIMARIA • TARDE/i)).toBeInTheDocument()
    })

    it('debe disparar el callback onSelect al pulsar un curso', () => {
      const handleSelect = vi.fn()
      render(
        <ClassroomSelector
          classrooms={mockClassrooms}
          selectedId="c1"
          onSelect={handleSelect}
          isFixedBaseMode={false}
        />
      )

      const secondBtn = screen.getByText('Segundo').closest('button')
      expect(secondBtn).toBeInTheDocument()
      if (secondBtn) {
        fireEvent.click(secondBtn)
      }

      expect(handleSelect).toHaveBeenCalledWith(mockClassrooms[1])
    })
  })

  describe('AssignmentsTable', () => {
    it('debe mostrar mensaje vacío cuando no hay asignaciones', () => {
      render(
        <AssignmentsTable
          assignments={[]}
          isFetching={false}
          onDeleteRequest={() => {}}
          canManage={true}
        />
      )

      expect(screen.getByText(/Este curso aún no tiene materias asignadas/i)).toBeInTheDocument()
    })

    it('debe renderizar las asignaciones en la tabla con la cabecera correspondiente', () => {
      render(
        <AssignmentsTable
          assignments={mockAssignments}
          isFetching={false}
          onDeleteRequest={() => {}}
          canManage={true}
        />
      )

      expect(screen.getByText('Matemática')).toBeInTheDocument()
      expect(screen.getByText('Juan Perez')).toBeInTheDocument()
      // Botón de eliminar debe estar presente si canManage es true
      expect(screen.getByTitle('Eliminar asignación')).toBeInTheDocument()
    })

    it('debe disparar onDeleteRequest al pulsar el botón de eliminar', () => {
      const handleDelete = vi.fn()
      render(
        <AssignmentsTable
          assignments={mockAssignments}
          isFetching={false}
          onDeleteRequest={handleDelete}
          canManage={true}
        />
      )

      const deleteBtn = screen.getByTitle('Eliminar asignación')
      fireEvent.click(deleteBtn)

      expect(handleDelete).toHaveBeenCalledWith(mockAssignments[0])
    })

    it('debe disparar onReassignRequest al pulsar el botón de reasignar', () => {
      const handleReassign = vi.fn()
      render(
        <AssignmentsTable
          assignments={mockAssignments}
          isFetching={false}
          onDeleteRequest={() => {}}
          onReassignRequest={handleReassign}
          canManage={true}
        />
      )

      const reassignBtn = screen.getByTitle('Reasignar Docente Titular')
      fireEvent.click(reassignBtn)

      expect(handleReassign).toHaveBeenCalledWith(mockAssignments[0])
    })

    it('no debe renderizar la columna "Acciones" ni los botones si canManage es false', () => {
      render(
        <AssignmentsTable
          assignments={mockAssignments}
          isFetching={false}
          onDeleteRequest={() => {}}
          canManage={false}
        />
      )

      expect(screen.queryByTitle('Eliminar asignación')).not.toBeInTheDocument()
      expect(screen.queryByTitle('Reasignar Docente Titular')).not.toBeInTheDocument()
      expect(screen.queryByText('Acciones')).not.toBeInTheDocument()
    })
  })
})
