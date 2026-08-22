# Guía de Movimiento y Animación (motion.md)

Este documento define la estrategia global de movimiento y micro-interacciones para el proyecto. En consonancia con el **Estilo Suizo**, el movimiento debe sentirse **físico, preciso, austero y extremadamente rápido**. Se prohíben las animaciones decorativas lentas que retrasan el flujo de trabajo del usuario.

---

## 1. Ajustes y Ajustes Preestablecidos (Framer Motion Presets)

Para mantener la consistencia entre todos los módulos, el movimiento se agrupa en dos categorías de presets exactos:

### Preset 1: Springs (Estructuras Físicas)
Reservado para elementos pesados de la interfaz que se deslizan sobre la pantalla, como paneles de Drawer lateral o tarjetas colapsables. Simula una física realista sin oscilaciones exageradas.

*   **Configuración:**
    *   `type: "spring"`
    *   `damping: 25` (Evita rebotes excesivos o sensación de elasticidad irreal)
    *   `stiffness: 220` (Asegura un arranque rápido y un frenado firme)
*   **Código de Ejemplo (Drawer):**
    ```tsx
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 220 }}
      className="relative h-full w-full max-w-md border-l border-uecg-line bg-white shadow-2xl"
    >
      {/* Contenido del Panel */}
    </motion.div>
    ```

### Preset 2: Fast Ease-Out (Menús y Capas Flotantes)
Reservado para elementos ligeros como menús contextuales, selectores (`SwissSelect`), modales de alerta de confirmación o dropdowns. Deben aparecer de forma instantánea.

*   **Configuración:**
    *   `duration: 0.12` a `0.15` segundos.
    *   `ease: "easeOut"`
*   **Código de Ejemplo (Dropdown / Select Portal):**
    ```tsx
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -4 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className="w-52 bg-white border border-uecg-line shadow-2xl"
    >
      {/* Opciones */}
    </motion.div>
    ```

---

## 2. Transición del Tema Global (View Transitions API)

El cambio entre el tema claro y oscuro (Obsidian Slate) se anima utilizando la moderna **View Transitions API** nativa del navegador. Esta animación genera un efecto de barrido circular ("theme-wipe") desde la esquina superior derecha:

```css
::view-transition-old(root),
::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
}

::view-transition-old(root) {
    z-index: 1;
}

::view-transition-new(root) {
    z-index: 9999;
    clip-path: circle(0% at top right);
    animation: theme-wipe 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

@keyframes theme-wipe {
    0% {
        clip-path: circle(0% at top right);
    }
    100% {
        clip-path: circle(150% at top right);
    }
}
```

---

## 3. Respeto al Movimiento Reducido (`prefers-reduced-motion`)

Por accesibilidad y cumplimiento WCAG, se debe desactivar el movimiento en usuarios que lo soliciten en la configuración de su sistema operativo.

> [!IMPORTANT]
> Cuando uses Framer Motion, consume el hook `useReducedMotion` para degradar de forma elegante las animaciones pesadas a desvanecimientos simples (`opacity`) o desactivarlas por completo:

```tsx
import { useReducedMotion, motion } from "framer-motion";

export const AccessibleDrawer = ({ isOpen }: { isOpen: boolean }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{
        x: isOpen ? 0 : "100%",
        opacity: isOpen ? 1 : 0
      }}
      transition={{
        // Si el usuario pide reducir movimiento, aplicamos una duración de 0 (instantáneo)
        type: shouldReduceMotion ? "just" : "spring",
        damping: 25,
        stiffness: 220
      }}
    >
      {/* Contenido */}
    </motion.div>
  );
};
```
