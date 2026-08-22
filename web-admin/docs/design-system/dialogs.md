# Modales y Paneles Desplazables (dialogs.md)

Este documento define la arquitectura y los estándares de comportamiento para todos los elementos superpuestos de la interfaz de usuario: cajones deslizantes laterales (`drawers`), diálogos de confirmación (`modals`) y ventanas flotantes. Estos elementos deben garantizar una accesibilidad intachable (foco y teclado) y desplegarse fuera del árbol DOM local para evitar recortes visuales.

---

## 1. El Uso Obligatorio de Portales (`React Portals`)

Todos los elementos emergentes flotantes deben montarse al final del documento principal (`document.body`) mediante `createPortal`. Esto los independiza de la maquetación y evita problemas de `z-index` heredados o cortes visuales producidos por propiedades `overflow: hidden` en componentes ancestros.

### Estructura Técnica Estándar:
```tsx
import { createPortal } from "react-dom";

export const UnifiedPortalComponent = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => {
  if (!isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {children}
    </div>,
    document.body
  );
};
```

---

## 2. Animaciones Coherentes (Framer Motion)

Los diálogos emergentes se componen de dos capas animadas con presets exactos:

1.  **Fondo Difuminado (Overlay):** Debe atenuarse suavemente mediante un fundido rápido de opacidad.
    *   `initial={{ opacity: 0 }}`
    *   `animate={{ opacity: 1 }}`
    *   `exit={{ opacity: 0 }}`
2.  **Panel Drawer Deslizante:** Debe desplazarse desde la derecha empleando física elástica (Preset Spring).
    *   `initial={{ x: "100%" }}`
    *   `animate={{ x: 0 }}`
    *   `exit={{ x: "100%" }}`
    *   `transition={{ type: "spring", damping: 25, stiffness: 220 }}`

---

## 3. Accesibilidad Rigurosa (A11y Checklist)

Cualquier diálogo o drawer generado debe incorporar en su ciclo de vida las siguientes tres funcionalidades nativas de accesibilidad:

### A. Control de Foco (`Focus Trapping`)
El foco del teclado (tecla `Tab`) debe estar atrapado dentro del panel emergente. Si el usuario llega al último elemento enfocable y pulsa `Tab`, el foco debe saltar al primer elemento. Si pulsa `Shift + Tab` en el primer elemento, debe saltar al último.

### B. Cierre con Escape
Pulsar la tecla `Escape` en el teclado debe cerrar inmediatamente el diálogo de forma incondicional, a menos que exista una operación de guardado en curso (`isSubmitting` / `isPending`).

### C. Retorno de Enfoque (`Focus Restoration`)
Al montarse el diálogo, se captura el elemento actualmente activo (`document.activeElement`). Al desmontarse o cerrarse el diálogo, se debe devolver el foco a dicho elemento de origen para evitar que el lector de pantalla pierda el punto de lectura.

### Implementación Estándar de Ciclo de A11y:
```tsx
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    
    if (e.key === "Tab") {
      if (!panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      const first = focusables[0] as HTMLElement;
      const last = focusables[focusables.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  const previousFocus = document.activeElement as HTMLElement;

  // Auto-foco en el primer control tras la animación
  setTimeout(() => {
    const firstInput = panelRef.current?.querySelector("input") as HTMLElement;
    firstInput?.focus();
  }, 150);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
    previousFocus?.focus(); // Restauración de foco al cerrar
  };
}, [isOpen, onClose]);
```
