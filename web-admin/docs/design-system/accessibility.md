# Accesibilidad y Estándares WCAG 2.1 AA (accessibility.md)

Este documento define la directiva oficial de accesibilidad para todo el desarrollo frontend del proyecto. La accesibilidad en este sistema no es un añadido opcional: es una prioridad de ingeniería que garantiza la operabilidad, legibilidad y solidez de la interfaz para todo tipo de usuarios, incluidos aquellos que navegan exclusivamente mediante lectores de pantalla o teclado.

---

## 1. Estándares WCAG 2.1 AA Obligatorios

Cualquier componente nuevo o refactorizado debe cumplir con el nivel **AA** de las directrices WCAG 2.1:

*   **Estructura Semántica:** Prohibido el uso de elementos `div` o `span` clickables sin semántica de interacción. Todo disparador interactivo debe maquetarse como `<button type="button">` o `<a href="...">`.
*   **Contraste Lumínico Mínimo:** Todos los elementos de texto e iconos interactivos deben mantener una relación de contraste cromático de al menos **4.5:1** contra el fondo.
*   **Etiquetado ARIA Seguro:**
    *   Los campos de entrada con error deben reflejar la propiedad `aria-invalid="true"`.
    *   La descripción de error debe estar enlazada mediante `aria-describedby="[input-id]-error"`.
    *   Cualquier botón con un icono puramente gráfico (ej. botón de cerrar con icono `X`) debe poseer una propiedad descriptiva `aria-label="Cerrar"` o un elemento `sr-only` legible únicamente por lectores de pantalla.

---

## 2. Protocolo de Navegación por Teclado

La navegación en la aplicación debe ser completamente operable sin ratón:

1.  **Indicadores de Enfoque (`Focus States`):** Se prohíbe remover el contorno visual del foco (`outline: none` sin fallback). Toda interacción debe contar con un estilo de foco visible y nítido.
    *   *Ejemplo de Foco Suizo:* `focus:outline-none focus:border-uecg-blue` para inputs, o `focus-within:border-uecg-blue` en elementos compuestos.
2.  **Atajos de Teclado Globales (Atajo `Ctrl+K`):** Los buscadores principales de todas las bandejas administrativas (ej. Usuarios, Aulas, Auditoría) deben activar su campo de búsqueda de manera automática al presionar el atajo `Ctrl+K` (o `Cmd+K` en macOS), enfocando y seleccionando el texto interno.
    ```tsx
    useEffect(() => {
      const handleGlobalKeys = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      };
      document.addEventListener("keydown", handleGlobalKeys);
      return () => document.removeEventListener("keydown", handleGlobalKeys);
    }, []);
    ```
3.  **Manejo de Escape:** Todo diálogo emergente (`modal`, `drawer`, `dropdown`) debe incorporar un escuchador global para interceptar la tecla `Escape` y cerrarse inmediatamente de forma segura.

---

## 3. Preferencias del Usuario (`Reduced Motion`)

El sistema debe adaptarse dinámicamente a las preferencias declaradas del sistema operativo del usuario. A través de la clase utilitaria `motion-reduce:` de Tailwind o mediante el hook `useReducedMotion` de Framer Motion, todas las transiciones estructurales deben desactivarse o simplificarse para evitar mareos o fatiga visual en usuarios con trastornos vestibulares.
