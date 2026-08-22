# Formularios y Controles de Entrada (forms.md)

Este documento define la estructura y el comportamiento de los formularios de la aplicación. Todo formulario debe estar regido por una validación estricta y transparente sustentada en esquemas de **Zod**, unificando la lógica con **React Hook Form** y decorando la interfaz con componentes de entrada limpios del **Estilo Suizo**.

---

## 1. El Componente Estándar `SwissInput`

Todos los campos de entrada de datos (`text`, `number`, `date`, etc.) deben consumir el componente compartido `SwissInput` o calcar sus estilos base.

### Características Clave:
*   **Contraste y Borde:** Bordes rectos (`rounded-none` implícito), fondo transparente, y cambio drástico de color de borde al enfocar (`focus:border-uecg-blue`).
*   **A11y Incorporado:** Utiliza `aria-invalid` y `aria-describedby` mapeados al estado de error del formulario.
*   **Etiqueta superior:** Siempre consume la clase `.label-swiss`.

```tsx
import React from 'react'

export interface SwissInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode
  error?: string
}

export const SwissInput = React.forwardRef<HTMLInputElement, SwissInputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <label htmlFor={id} className="label-swiss flex items-center gap-2">
          {label}
        </label>
        <input
          id={id}
          {...props}
          ref={ref}
          className={`w-full border bg-transparent px-4 py-3 text-uecg-text focus:outline-none transition-colors ${className} ${
            error ? 'border-red-500 focus:border-red-500' : 'border-uecg-line focus:border-uecg-blue'
          }`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error && (
          <p id={`${id}-error`} className="mt-2 text-xs font-bold uppercase tracking-widest text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }
)
```

---

## 2. Consolidación de Selectores (`SwissSelect`)

Para evitar la duplicidad histórica detectada en el análisis, los selectores de formulario desplegables deben centralizarse utilizando el patrón `SwissSelect` interactivo.

### Características del Selector de Diseño Suizo:
1.  **Botón Disparador Plano:** Rígido con un icono de indicador (`ChevronDown` rotatorio).
2.  **Portal Flotante:** Desplegable contenido en un portal o un contenedor absoluto con alto `z-index`, animado con un desvanecimiento rápido de Framer Motion.
3.  **Filtrado e Interacción:** Opciones claras en mayúsculas, hover reactivo que invierte los colores (fondo azul corporativo con texto blanco).

---

## 3. Integración con React Hook Form y Zod

Todo formulario debe declarar un esquema de validación descriptivo. Los mensajes de error de validación deben escribirse en **español** y en **mayúsculas**.

### Ejemplo de Estructura de Formulario Autorizada:
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 1. Esquema descriptivo
const userFormSchema = z.object({
  username: z.string().min(3, "EL NOMBRE DE USUARIO DEBE TENER AL MENOS 3 CARACTERES"),
  email: z.string().email("DIRECCIÓN DE CORREO ELECTRÓNICO INVÁLIDA"),
});

type FormValues = z.infer<typeof userFormSchema>;

export const UserEditForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(userFormSchema),
  });

  const onSubmit = (data: FormValues) => {
    // Envío controlado
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <SwissInput
        id="username"
        label="Nombre de Usuario"
        error={errors.username?.message}
        {...register("username")}
      />
      {/* Botón de envío */}
      <button type="submit" className="btn-swiss w-full py-3.5">
        Guardar Cambios
      </button>
    </form>
  );
};
```
