import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SetupPasswordForm } from '../setup-password-form'

const mockNavigate = vi.fn()
const mockMutate = vi.fn()
let mockIsPending = false

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('../../hooks/use-setup-password', () => ({
  useSetupPassword: () => ({
    mutate: mockMutate,
    isPending: mockIsPending,
  })
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('SetupPasswordForm Component', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
    mockMutate.mockClear()
    mockIsPending = false
  })

  it('debe alertar y redirigir si no hay token en localStorage', () => {
    render(<SetupPasswordForm />)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('debe renderizar los campos si hay un token válido', () => {
    localStorage.setItem('uecg_setup_token', 'valid-token')
    render(<SetupPasswordForm />)

    expect(screen.getByLabelText(/Clave Temporal/i, { selector: 'input' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Nueva Clave/i, { selector: 'input' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Confirmar Clave/i, { selector: 'input' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Actualizar e Ingresar/i })).toBeInTheDocument()
  })

  it('debe alternar la visibilidad de los campos de contraseña', () => {
    localStorage.setItem('uecg_setup_token', 'valid-token')
    render(<SetupPasswordForm />)

    const newPasswordInput = screen.getByLabelText(/Nueva Clave/i, { selector: 'input' }) as HTMLInputElement
    expect(newPasswordInput.type).toBe('password')

    const toggleButton = screen.getByLabelText(/Mostrar nueva clave/i)
    fireEvent.click(toggleButton)

    expect(newPasswordInput.type).toBe('text')
    expect(screen.getByLabelText(/Ocultar nueva clave/i)).toBeInTheDocument()
  })

  it('debe mostrar un error si las contraseñas no coinciden', async () => {
    localStorage.setItem('uecg_setup_token', 'valid-token')
    render(<SetupPasswordForm />)

    fireEvent.change(screen.getByLabelText(/Clave Temporal/i, { selector: 'input' }), {
      target: { value: 'temp123' },
    })
    fireEvent.change(screen.getByLabelText(/Nueva Clave/i, { selector: 'input' }), {
      target: { value: 'newpassword123' },
    })
    fireEvent.change(screen.getByLabelText(/Confirmar Clave/i, { selector: 'input' }), {
      target: { value: 'differentpassword' },
    })

    const submitBtn = screen.getByRole('button', { name: /Actualizar e Ingresar/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Las contraseñas no coinciden/i)).toBeInTheDocument()
    })

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('debe enviar la mutación al enviar contraseñas válidas y coincidentes', async () => {
    localStorage.setItem('uecg_setup_token', 'valid-token')
    render(<SetupPasswordForm />)

    fireEvent.change(screen.getByLabelText(/Clave Temporal/i, { selector: 'input' }), {
      target: { value: 'temp123' },
    })
    fireEvent.change(screen.getByLabelText(/Nueva Clave/i, { selector: 'input' }), {
      target: { value: 'newpassword123' },
    })
    fireEvent.change(screen.getByLabelText(/Confirmar Clave/i, { selector: 'input' }), {
      target: { value: 'newpassword123' },
    })

    const submitBtn = screen.getByRole('button', { name: /Actualizar e Ingresar/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        setupToken: 'valid-token',
        newPassword: 'newpassword123',
      })
    })
  })
})
