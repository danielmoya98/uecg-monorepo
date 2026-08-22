import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ApproveEnrollmentDrawer from '../ApproveEnrollmentDrawer'

// Mock state variables to customize hook responses per test
let mockQueryData: unknown = null;
let mockQueryIsLoading = false;
let mockMutationIsPending = false;
const mockMutate = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', () => {
  return {
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
    useQuery: () => ({
      data: mockQueryData,
      isLoading: mockQueryIsLoading,
    }),
    useMutation: (options: { onSuccess?: () => void }) => ({
      mutate: (...args: unknown[]) => {
        mockMutate(...args);
        if (options?.onSuccess) {
          options.onSuccess();
        }
      },
      isPending: mockMutationIsPending,
    }),
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@react-pdf/renderer', () => ({
  pdf: () => ({
    toBlob: async () => new Blob(['pdf-content'], { type: 'application/pdf' }),
  }),
}));

vi.mock('../RudePdfTemplate', () => ({
  default: () => null,
}));

// Mock URL APIs that aren't fully implemented in JSDOM
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn(() => 'mock-url');
  window.URL.revokeObjectURL = vi.fn();
}

describe('ApproveEnrollmentDrawer Component', () => {
  const defaultEnrollment = {
    id: 'enroll-1',
    studentName: 'JUAN PEREZ GOMEZ',
    ci: '12345678',
    type: 'NUEVO',
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockQueryData = null;
    mockQueryIsLoading = false;
    mockMutationIsPending = false;
    mockOnClose.mockClear();
    mockMutate.mockClear();
    mockInvalidateQueries.mockClear();
  });

  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(
      <ApproveEnrollmentDrawer
        isOpen={false}
        onClose={mockOnClose}
        enrollment={defaultEnrollment}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el drawer con el rol dialog y la información del estudiante si isOpen es true', () => {
    render(
      <ApproveEnrollmentDrawer
        isOpen={true}
        onClose={mockOnClose}
        enrollment={defaultEnrollment}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('JUAN PEREZ GOMEZ')).toBeInTheDocument();
    expect(screen.getByText('CI: 12345678')).toBeInTheDocument();
  });

  it('debe llamar a onClose al presionar la tecla Escape', () => {
    render(
      <ApproveEnrollmentDrawer
        isOpen={true}
        onClose={mockOnClose}
        enrollment={defaultEnrollment}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('debe deshabilitar el botón de confirmar si se requiere un nuevo código RUDE y este es muy corto', () => {
    render(
      <ApproveEnrollmentDrawer
        isOpen={true}
        onClose={mockOnClose}
        enrollment={defaultEnrollment}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Confirmar e Inscribir/i });
    expect(submitBtn).toBeDisabled();

    const input = screen.getByLabelText(/Código RUDE Oficial/i);
    fireEvent.change(input, { target: { value: '1234' } }); // < 5 caracteres
    expect(submitBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: '12345' } }); // >= 5 caracteres
    expect(submitBtn).toBeEnabled();
  });

  it('debe habilitar el botón si la inscripción es de tipo ANTIGUO incluso si no tiene código RUDE', () => {
    const antiguoEnrollment = {
      ...defaultEnrollment,
      type: 'ANTIGUO',
    };

    render(
      <ApproveEnrollmentDrawer
        isOpen={true}
        onClose={mockOnClose}
        enrollment={antiguoEnrollment}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Confirmar e Inscribir/i });
    expect(submitBtn).toBeEnabled();
  });

  it('debe deshabilitar el input del código RUDE si el estudiante ya cuenta con uno', () => {
    const enrollmentWithRude = {
      ...defaultEnrollment,
      rudeCode: '80730102030405',
    };

    render(
      <ApproveEnrollmentDrawer
        isOpen={true}
        onClose={mockOnClose}
        enrollment={enrollmentWithRude}
      />
    );

    const input = screen.getByLabelText(/Código RUDE Oficial/i);
    expect(input).toBeDisabled();
    expect(input).toHaveValue('80730102030405');
  });

  it('debe renderizar el listado de hermanos si se detectan en la consulta', async () => {
    mockQueryData = {
      siblings: [
        { names: 'MARIA PEREZ GOMEZ', classroom: 'Primero "A" - PRIMARIA' },
        { names: 'JOSE PEREZ GOMEZ', classroom: 'Tercero "B" - SECUNDARIA' },
      ],
    };

    render(
      <ApproveEnrollmentDrawer
        isOpen={true}
        onClose={mockOnClose}
        enrollment={defaultEnrollment}
      />
    );

    expect(screen.getByText(/Familia Detectada \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('MARIA PEREZ GOMEZ')).toBeInTheDocument();
    expect(screen.getByText('Primero "A" - PRIMARIA')).toBeInTheDocument();
    expect(screen.getByText('JOSE PEREZ GOMEZ')).toBeInTheDocument();
    expect(screen.getByText('Tercero "B" - SECUNDARIA')).toBeInTheDocument();
  });

  it('debe enviar la mutación de aprobación al enviar el formulario', async () => {
    render(
      <ApproveEnrollmentDrawer
        isOpen={true}
        onClose={mockOnClose}
        enrollment={defaultEnrollment}
      />
    );

    const input = screen.getByLabelText(/Código RUDE Oficial/i);
    fireEvent.change(input, { target: { value: '80730102' } });

    const submitBtn = screen.getByRole('button', { name: /Confirmar e Inscribir/i });
    fireEvent.click(submitBtn);

    expect(mockMutate).toHaveBeenCalledTimes(1);
  });
});
