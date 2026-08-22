import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProfileForm from "../profile-form";
import ChangePasswordDrawer from "../change-password-drawer";
import type { UserProfile } from "../../api/profile.service";

// Mock the useChangePassword hook to isolate drawer tests
const mockChangePassword = vi.fn();
vi.mock("../../hooks/use-change-password", () => ({
  useChangePassword: (onSuccessCallback?: () => void) => ({
    changePassword: mockChangePassword.mockImplementation(() => {
      if (onSuccessCallback) onSuccessCallback();
    }),
    isSubmitting: false,
  }),
}));

const mockProfile: UserProfile = {
  id: "u1",
  fullName: "JUAN PEREZ",
  email: "juan.perez@uecg.edu.bo",
  role: "DOCENTE",
  status: "ACTIVE",
  ci: "1234567",
  phone: "70012345",
  address: "Av. Principal 123",
  specialty: "MATEMATICAS",
};

describe("Módulo Profile - Pruebas Unitarias y de Humo", () => {
  describe("ProfileForm", () => {
    const onSubmitMock = vi.fn();

    beforeEach(() => {
      onSubmitMock.mockClear();
    });

    it("debe renderizar la ficha personal con los datos correctos", () => {
      render(
        <ProfileForm
          profileData={mockProfile}
          isSubmitting={false}
          onSubmit={onSubmitMock}
        />
      );

      expect(screen.getByText(/Ficha Personal/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Correo Institucional/i)).toHaveValue(
        "juan.perez@uecg.edu.bo"
      );
      expect(screen.getByLabelText(/Nivel de Acceso/i)).toHaveValue("DOCENTE");
      expect(screen.getByLabelText(/Nombre Completo/i)).toHaveValue(
        "JUAN PEREZ"
      );
      expect(screen.getByLabelText(/C.I. \/ Documento/i)).toHaveValue(
        "1234567"
      );
      expect(screen.getByLabelText(/Teléfono Celular/i)).toHaveValue(
        "70012345"
      );
      expect(screen.getByLabelText(/Dirección de Domicilio/i)).toHaveValue(
        "Av. Principal 123"
      );
      expect(screen.getByLabelText(/Especialidad \/ Área/i)).toHaveValue(
        "MATEMATICAS"
      );
    });

    it("debe mostrar error de validación cuando el nombre completo es demasiado corto", async () => {
      render(
        <ProfileForm
          profileData={mockProfile}
          isSubmitting={false}
          onSubmit={onSubmitMock}
        />
      );

      const nameInput = screen.getByLabelText(/Nombre Completo/i);
      fireEvent.change(nameInput, { target: { value: "JP" } });

      const submitButton = screen.getByRole("button", {
        name: /Actualizar Ficha/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/El nombre debe tener al menos 3 caracteres/i)
        ).toBeInTheDocument();
      });

      expect(onSubmitMock).not.toHaveBeenCalled();
    });

    it("debe enviar el formulario correctamente con datos válidos", async () => {
      render(
        <ProfileForm
          profileData={mockProfile}
          isSubmitting={false}
          onSubmit={onSubmitMock}
        />
      );

      const nameInput = screen.getByLabelText(/Nombre Completo/i);
      fireEvent.change(nameInput, { target: { value: "JUAN PEREZ MODIFICADO" } });

      const submitButton = screen.getByRole("button", {
        name: /Actualizar Ficha/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalled();
        expect(onSubmitMock.mock.calls[0][0]).toEqual({
          fullName: "JUAN PEREZ MODIFICADO",
          ci: "1234567",
          phone: "70012345",
          address: "Av. Principal 123",
          specialty: "MATEMATICAS",
        });
      });
    });
  });

  describe("ChangePasswordDrawer", () => {
    const onCloseMock = vi.fn();

    beforeEach(() => {
      onCloseMock.mockClear();
      mockChangePassword.mockClear();
    });

    it("no debe renderizar nada si isOpen es falso", () => {
      const { container } = render(
        <ChangePasswordDrawer isOpen={false} onClose={onCloseMock} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("debe renderizar el formulario si isOpen es verdadero", () => {
      render(<ChangePasswordDrawer isOpen={true} onClose={onCloseMock} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/Cambiar Clave/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contraseña Actual/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Nueva Contraseña$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Confirmar Nueva Contraseña$/i)).toBeInTheDocument();
    });

    it("debe mostrar errores de validación si se envía vacío", async () => {
      render(<ChangePasswordDrawer isOpen={true} onClose={onCloseMock} />);

      const submitButton = screen.getByRole("button", {
        name: /Actualizar Contraseña/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Ingrese su contraseña actual/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/La nueva contraseña debe tener al menos 6 caracteres/i)
        ).toBeInTheDocument();
      });
    });

    it("debe mostrar error si las contraseñas nuevas no coinciden", async () => {
      render(<ChangePasswordDrawer isOpen={true} onClose={onCloseMock} />);

      fireEvent.change(screen.getByLabelText(/Contraseña Actual/i), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText(/^Nueva Contraseña$/i), {
        target: { value: "newpassword123" },
      });
      fireEvent.change(screen.getByLabelText(/^Confirmar Nueva Contraseña$/i), {
        target: { value: "diffpassword123" },
      });

      const submitButton = screen.getByRole("button", {
        name: /Actualizar Contraseña/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Las contraseñas nuevas no coinciden/i)
        ).toBeInTheDocument();
      });
    });

    it("debe llamar a changePassword con los datos correctos si los campos son válidos", async () => {
      render(<ChangePasswordDrawer isOpen={true} onClose={onCloseMock} />);

      fireEvent.change(screen.getByLabelText(/Contraseña Actual/i), {
        target: { value: "currentPassword1" },
      });
      fireEvent.change(screen.getByLabelText(/^Nueva Contraseña$/i), {
        target: { value: "newPassword12" },
      });
      fireEvent.change(screen.getByLabelText(/^Confirmar Nueva Contraseña$/i), {
        target: { value: "newPassword12" },
      });

      const submitButton = screen.getByRole("button", {
        name: /Actualizar Contraseña/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockChangePassword).toHaveBeenCalledWith({
          currentPassword: "currentPassword1",
          newPassword: "newPassword12",
        });
        expect(onCloseMock).toHaveBeenCalled();
      });
    });
  });
});
