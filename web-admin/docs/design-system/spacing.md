# Sistema de Espaciado y Composición (spacing.md)

Este documento define las reglas de espaciado, composición y alineación del frontend del proyecto. Inspirado en el **Diseño Suizo**, el sistema prioriza la rigidez estructural, la delimitación por líneas y el ritmo visual constante.

---

## 1. Escala de Espaciado (Tailwind Tokens)

La aplicación utiliza la escala de espaciado estándar de Tailwind CSS. Sin embargo, para mantener la coherencia geométrica, solo ciertos valores están autorizados para layouts principales:

*   **`px-6 py-4` / `p-6` (24px):** El espaciado por defecto para rellenos internos de tarjetas, paneles, y contenedores principales (`swiss-cell`).
*   **`p-5` (20px):** Espaciado intermedio, reservado para cabeceras de Drawers laterales y listados compactos.
*   **`px-3 py-3` / `p-3` (12px):** Relleno por defecto para controles de formulario, botones y inputs (`swiss-input`).
*   **`p-1.5` / `p-2` (6px - 8px):** Reservado para micro-espaciados, botones de cierre de modales y hovers de menú contextual.

---

## 2. El Sistema "Swiss Grid" (Rejilla Suiza)

A diferencia de las rejillas de diseño tradicionales basadas en columnas invisibles con separaciones flotantes (`gap-*`), el diseño de este proyecto favorece la **separación física delimitada por hilos**.

### El Patrón de Celdas Colapsadas
Para construir secciones en cuadrícula, se prefiere colapsar los bordes en lugar de dejar espacios vacíos:

```tsx
export const ExampleSwissGrid = () => (
  <div className="swiss-grid grid grid-cols-1 md:grid-cols-3">
    <div className="swiss-cell">
      <h3 className="label-swiss">Celda A</h3>
      <p>Contenido de la primera columna.</p>
    </div>
    <div className="swiss-cell">
      <h3 className="label-swiss">Celda B</h3>
      <p>Contenido de la segunda columna.</p>
    </div>
    <div className="swiss-cell">
      <h3 className="label-swiss">Celda C</h3>
      <p>Contenido de la tercera columna.</p>
    </div>
  </div>
);
```

#### Estilos Asociados en CSS (`src/index.css`):
```css
.swiss-grid {
    display: grid;
    border-left: 1px solid var(--color-uecg-line);
    border-top: 1px solid var(--color-uecg-line);
}

.swiss-cell {
    border-right: 1px solid var(--color-uecg-line);
    border-bottom: 1px solid var(--color-uecg-line);
    padding: 1.5rem; /* Equivalent to p-6 */
}
```

> [!TIP]
> Al usar el patrón `swiss-grid` y `swiss-cell`, se reduce a cero la necesidad de adivinar el posicionamiento de las tarjetas. Toda la estructura se lee como un plano arquitectónico técnico.

---

## 3. Composición Responsiva (Layout Breakpoints)

Para los paneles y contenedores estructurales de la aplicación, se establecen las siguientes directivas de adaptación:

*   **Márgenes del Contenedor Principal:**
    *   **Mobile (`< 768px`):** Relleno de `p-4` a los bordes de la pantalla.
    *   **Tablet & Desktop (`>= 768px`):** Relleno de `p-6` o `p-8` para una visualización premium y desahogada.
*   **Drawers Laterales de Edición:**
    *   Deberán ocupar el `100%` del ancho en pantallas móviles.
    *   Deberán limitarse a un ancho de `max-w-md` (`448px`) o `max-w-[400px]` en pantallas grandes.
