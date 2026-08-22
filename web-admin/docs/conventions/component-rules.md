# Reglas de Componentes - UECG React Vite

Este documento contiene las directrices obligatorias para la creación y refactorización de componentes en la aplicación.

## 1. Separación de Responsabilidades: UI vs Controlador

Los componentes deben ser altamente especializados y desacoplados:

* **Componentes de Página (Controllers/Views):**
  * Típicamente ubicados en `src/app/router/_authenticated/...` o como contenedores principales en `src/features/[feature]/components/[feature]-page.tsx`.
  * Contienen la invocación a los hooks de servidor (`useAcademicYearsData`, etc.).
  * Orquestan el estado visual y pasan datos y callbacks a componentes de UI puros.
* **Componentes de UI Presentacionales (Puros):**
  * Ubicados en `src/features/[feature]/components/[sub-elements].tsx` o en `src/shared/components/`.
  * Reciben datos mediante `props` estrictamente tipados.
  * NO realizan llamadas directas de mutación o queries (ej. no deben invocar `useMutation` o `useQuery`).
  * Utilizan micro-animaciones con `framer-motion` para mejorar la experiencia de usuario.

---

## 2. El Patrón Drawer (Cajón Desplazable) y Superposiciones

Los modales, cajones y menús desplegables contextuales deben cumplir con las siguientes reglas arquitectónicas:

1. **Uso Obligatorio de Portales:** Todas las capas flotantes o superposiciones que cubran el flujo normal de la pantalla deben inyectarse mediante `createPortal(..., document.body)` para evitar problemas de posicionamiento y solapamiento CSS (`z-index`).
2. **Control Estricto de `z-index`:** Los drawers y diálogos globales deben usar un `z-index` centralizado y controlado como `z-[9999]` para asegurar que se posicionen por encima del menú de navegación superior y lateral.
3. **Manejo de Animaciones Geométricas:** Se debe utilizar `AnimatePresence` y `motion` de `framer-motion` para entradas y salidas suaves:
   * Entrada del fondo difuminado (*overlay*): `initial={{ opacity: 0 }}` -> `animate={{ opacity: 1 }}`.
   * Entrada del cajón de derecha a izquierda: `initial={{ x: "100%" }}` -> `animate={{ x: 0 }}` -> `exit={{ x: "100%" }}`.
4. **Resiliencia de Menús Contextuales:** Los dropdowns en tablas y listas deben calcular sus coordenadas en relación al viewport y renderizarse en portales, garantizando que nunca se corten en los bordes de la pantalla (siguiendo el patrón `resilient-context-menus-and-nested-dropdowns`).

---

## 3. Erradicación del Tipo `any` y Tipado Estricto

* **Interfaces de Props:** Todos los componentes presentacionales deben definir explícitamente su interfaz de props utilizando TypeScript estricto. Queda terminantemente prohibido el uso de `any` para tipar props de funciones o conjuntos de datos:
  ```typescript
  // ❌ INCORRECTO
  export const Table = ({ years, onEdit }: any) => { ... }

  //  CORRECTO
  interface TableProps {
    years: AcademicYear[];
    onEdit: (year: AcademicYear) => void;
    isLoading: boolean;
  }
  export const Table = ({ years, onEdit, isLoading }: TableProps) => { ... }
  ```
* **Eventos de Formulario y Sintaxis de Inputs:** Se deben tipar adecuadamente los eventos de elementos HTML genéricos, tales como `React.MouseEvent` o `React.ChangeEvent<HTMLInputElement>`.

---

## 4. Accesibilidad (A11y) y Rendimiento

* **Botones e Interactivos:** Todo elemento clickable debe ser un elemento semántico `<button>` o tener atributos de rol y eventos de teclado apropiados. Los botones de acción deben poseer estados visuales deshabilitados (`disabled`) y mostrar indicadores visuales de progreso (`Loader2` animado) cuando se esté ejecutando una operación asíncrona.
* **Reducción de Renderizados (Rerenders):** Mapear listas usando `key`s únicas y consistentes (ej. `y.id` en lugar del índice del array). Los dropdowns y modales no deben renderizarse innecesariamente en el árbol DOM si su estado `isOpen` es falso.
