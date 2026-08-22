import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ClassPeriodsTable from '../class-periods-table'
import ClassPeriodForm from '../class-period-form'
import type { ClassPeriod } from '../../types/class-periods.types'

const mockPeriods: ClassPeriod[] = [
  {
    id: 'p1',
    name: '1RA HORA',
    startTime: '08:00',
    endTime: '08:45',
    shift: 'MANANA',
    isBreak: false,
    order: 1,
  },
  {
    id: 'p2',
    name: 'RECREO',
    startTime: '08:45',
    endTime: '09:00',
    shift: 'MANANA',
    isBreak: true,
    order: 2,
  },
]

describe('Módulo Class Periods - Pruebas Unitarias', () => {
  describe('ClassPeriodsTable', () => {
    it('debe renderizar el spinner de carga si isLoading es verdadero', () => {
      render(
        <ClassPeriodsTable
          periods={[]}
          isLoading={true}
          isDeleting={false}
          onDelete={() => {}}
        />
      )
      expect(screen.getByLabelText(/Cargando períodos de clase/i)).toBeInTheDocument()
    })

    it('debe renderizar mensaje de vacío si no hay periodos', () => {
      render(
        <ClassPeriodsTable
          periods={[]}
          isLoading={false}
          isDeleting={false}
          onDelete={() => {}}
        />
      )
      expect(screen.getByText(/El cronograma está vacío/i)).toBeInTheDocument()
    })

    it('debe renderizar la lista de periodos correctamente', () => {
      render(
        <ClassPeriodsTable
          periods={mockPeriods}
          isLoading={false}
          isDeleting={false}
          onDelete={() => {}}
        />
      )

      expect(screen.getByText('1RA HORA')).toBeInTheDocument()
      expect(screen.getByText(/08:00.*08:45/)).toBeInTheDocument()
      expect(screen.getByText('Clase')).toBeInTheDocument()

      expect(screen.getByText('RECREO')).toBeInTheDocument()
      expect(screen.getByText(/08:45.*09:00/)).toBeInTheDocument()
      expect(screen.getByText('Recreo')).toBeInTheDocument()
    })

    it('debe llamar a onDelete cuando se hace click en el botón de borrar', () => {
      const onDeleteMock = vi.fn()
      render(
        <ClassPeriodsTable
          periods={mockPeriods}
          isLoading={false}
          isDeleting={false}
          onDelete={onDeleteMock}
        />
      )

      const deleteButtons = screen.getAllByRole('button', { name: /Eliminar período/i })
      fireEvent.click(deleteButtons[0])

      expect(onDeleteMock).toHaveBeenCalledWith('p1')
    })
  })

  describe('ClassPeriodForm', () => {
    const onSubmitMock = vi.fn()

    beforeEach(() => {
      onSubmitMock.mockClear()
    })

    it('debe renderizar los inputs correctamente con sus valores por defecto', () => {
      render(
        <ClassPeriodForm
          onSubmit={onSubmitMock}
          isPending={false}
          defaultOrder={3}
          selectedShift="MANANA"
        />
      )

      expect(screen.getByLabelText('Nombre Oficial')).toBeInTheDocument()
      expect(screen.getByLabelText('Inicio')).toBeInTheDocument()
      expect(screen.getByLabelText('Fin')).toBeInTheDocument()
      expect(screen.getByLabelText('Posición')).toHaveValue(3)
      expect(screen.getByLabelText('Descanso / Recreo')).not.toBeChecked()
    })

    it('debe mostrar errores de validación para campos vacíos', async () => {
      render(
        <ClassPeriodForm
          onSubmit={onSubmitMock}
          isPending={false}
          defaultOrder={1}
          selectedShift="MANANA"
        />
      )

      const submitButton = screen.getByRole('button', { name: /Registrar Periodo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/El nombre es requerido/i)).toBeInTheDocument()
        expect(screen.getByText(/Hora de inicio inválida/i)).toBeInTheDocument()
        expect(screen.getByText(/Hora de fin inválida/i)).toBeInTheDocument()
      })

      expect(onSubmitMock).not.toHaveBeenCalled()
    })

    it('debe mostrar un error si la hora de fin es anterior a la hora de inicio', async () => {
      render(
        <ClassPeriodForm
          onSubmit={onSubmitMock}
          isPending={false}
          defaultOrder={1}
          selectedShift="MANANA"
        />
      )

      fireEvent.change(screen.getByLabelText('Nombre Oficial'), { target: { value: '2DA HORA' } })
      fireEvent.change(screen.getByLabelText('Inicio'), { target: { value: '10:00' } })
      fireEvent.change(screen.getByLabelText('Fin'), { target: { value: '09:00' } })

      const submitButton = screen.getByRole('button', { name: /Registrar Periodo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/La hora de fin debe ser posterior a la de inicio/i)).toBeInTheDocument()
      })

      expect(onSubmitMock).not.toHaveBeenCalled()
    })

    it('debe llamar a onSubmit con los datos correctos si los campos son válidos', async () => {
      render(
        <ClassPeriodForm
          onSubmit={onSubmitMock}
          isPending={false}
          defaultOrder={1}
          selectedShift="MANANA"
        />
      )

      fireEvent.change(screen.getByLabelText('Nombre Oficial'), { target: { value: '1RA HORA' } })
      fireEvent.change(screen.getByLabelText('Inicio'), { target: { value: '08:00' } })
      fireEvent.change(screen.getByLabelText('Fin'), { target: { value: '08:45' } })
      fireEvent.click(screen.getByLabelText('Descanso / Recreo'))

      const submitButton = screen.getByRole('button', { name: /Registrar Periodo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith({
          name: '1RA HORA',
          startTime: '08:00',
          endTime: '08:45',
          shift: 'MANANA',
          isBreak: true,
          order: 1,
        })
      })
    })
  })
})
