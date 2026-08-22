import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LoginForm } from '../login-form'

const mockMutate = vi.fn()
let mockIsPending = false

vi.mock('../../hooks/use-login', () => ({
  useLogin: () => ({
    mutate: mockMutate,
    isPending: mockIsPending,
  })
}))

describe('LoginForm Component', () => {
  beforeEach(() => {
    mockMutate.mockClear()
    mockIsPending = false
  })

  it('debe renderizar los campos de correo y contraseña', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/Correo Institucional/i, { selector: 'input' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Contraseña/i, { selector: 'input' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Autorizar Ingreso/i })).toBeInTheDocument()
  })

  it('debe alternar la visibilidad de la contraseña al hacer clic en el botón de visibilidad', () => {
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText(/Contraseña/i, { selector: 'input' }) as HTMLInputElement
    expect(passwordInput.type).toBe('password')

    const toggleButton = screen.getByLabelText(/Mostrar contraseña/i)
    fireEvent.click(toggleButton)

    expect(passwordInput.type).toBe('text')
    expect(screen.getByLabelText(/Ocultar contraseña/i)).toBeInTheDocument()

    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('debe mostrar errores de validación si los campos se envían vacíos', async () => {
    render(<LoginForm />)

    const submitBtn = screen.getByRole('button', { name: /Autorizar Ingreso/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/El correo es obligatorio/i)).toBeInTheDocument()
      expect(screen.getByText(/Mínimo 6 caracteres/i)).toBeInTheDocument()
    })

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('debe llamar a la mutación de login al enviar credenciales válidas', async () => {
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/Correo Institucional/i, { selector: 'input' }), {
      target: { value: 'test@uecg.edu.bo' },
    })
    fireEvent.change(screen.getByLabelText(/Contraseña/i, { selector: 'input' }), {
      target: { value: 'password123' },
    })

    const submitBtn = screen.getByRole('button', { name: /Autorizar Ingreso/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@uecg.edu.bo',
        password: 'password123',
      })
    })
  })
})
