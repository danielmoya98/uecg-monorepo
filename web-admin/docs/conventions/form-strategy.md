# Estrategia de Formularios - UECG React Vite

Este documento establece las directrices para la creación, validación y gestión de formularios interactivos dentro de la aplicación.

## 1. Librerías Estándar y Roles

Para garantizar coherencia, facilidad de mantenimiento y un rendimiento visual libre de re-renders innecesarios, se utilizan exclusivamente:

* **React Hook Form (`react-hook-form`):** Para controlar el estado del formulario, registro de inputs, envío y ciclo de vida de los campos.
* **Zod (`zod`):** Para la validación estricta de esquemas de datos del lado del cliente, asegurando la concordancia de tipos antes del envío al backend.
* **Hook Form Resolvers (`@hookform/resolvers/zod`):** El puente conector para acoplar la validación de Zod con el ciclo de vida de React Hook Form.

---

## 2. Definición del Esquema de Validación (Schema)

Los esquemas de Zod deben declararse fuera del componente o en un archivo independiente dentro de `schemas/` para evitar re-creaciones en cada renderizado.

### Reglas de Coerción y Refinamientos
* **Coerción de Tipos:** Los campos numéricos que viajan como strings en los formularios nativos deben convertirse usando `z.coerce.number()`.
* **Reglas Cruzadas (Refinement):** Para validar relaciones lógicas entre campos (ej. la fecha de inicio debe ser anterior a la de fin), se debe usar `.refine()` al final del esquema de Zod con su respectivo mensaje y ruta del campo de error.

```typescript
import * as z from "zod";

const formSchema = z
  .object({
    year: z.coerce.number().min(2020, "El año debe ser 2020 o superior"),
    name: z.string().min(3, "Mínimo 3 caracteres"),
    startDate: z.string().min(1, "Seleccione la fecha de inicio"),
    endDate: z.string().min(1, "Seleccione la fecha de fin"),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "La fecha de inicio debe ser anterior a la fecha de fin",
    path: ["endDate"], // Redirige el error visual al campo endDate
  });
```

---

## 3. Implementación en Componentes

Al usar `useForm`, siempre se deben proveer valores iniciales completos a través de `defaultValues` para evitar advertencias de React sobre inputs no controlados (*uncontrolled inputs*).

```typescript
const {
  register,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    year: new Date().getFullYear(),
    name: "",
    startDate: "",
    endDate: "",
  },
});
```

### Gestión de Estados de Carga e Interfaz
1. **Deshabilitación Síncrona:** Durante el envío asíncrono (`isPending` o `isSubmitting`), todos los inputs, selectores y botones del formulario deben ponerse en estado deshabilitado (`disabled`) para evitar doble envío de datos.
2. **Alertas de Error:** Los mensajes de error de validación generados por Zod deben renderizarse debajo de cada campo correspondiente de manera sutil en color rojo y con tipografía legible, utilizando `aria-invalid={!!errors.field}` para una accesibilidad semántica óptima.
3. **Retroalimentación con Sonner:** Las respuestas exitosas o los fallos críticos del servidor deben notificarse de inmediato mediante el uso de notificaciones emergentes controladas con `toast` de la librería `sonner`.
