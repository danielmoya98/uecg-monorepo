# Prompt: Auditoría de Movimiento y Animaciones (motion-review.md)

Este prompt audita de forma específica el comportamiento de transiciones, físicas de resorte y micro-interacciones mediante **Framer Motion**, garantizando fluidez, rapidez y cumplimiento de políticas de reducción de movimiento.

---

## Instrucciones de Uso

Copia y pega el bloque inferior en tu chat con la IA cuando desees evaluar la calidad y el rendimiento de las animaciones en tus componentes.

```markdown
Actúa como Principal Motion Designer e Ingeniero de Animación.

Audita el siguiente fragmento de código de React y Framer Motion para asegurar que las transiciones sean dinámicas, profesionales, rápidas y accesibles.

### CÓDIGO A AUDITAR
[Pega el código del componente o ruta del archivo aquí]

### DIRECTIVAS DE MOVIMIENTO A AUDITAR
1. **Física del Resorte (Springs):** Si el componente es un Drawer lateral deslizante, ¿utiliza la configuración exacta `type: "spring", damping: 25, stiffness: 220`?
2. **Duración de Controles:** Si el componente es un dropdown o modal flotante, ¿utiliza una entrada ultra rápida con `ease: "easeOut"` y una duración contenida entre `0.12` y `0.15` segundos?
3. **Control de Ciclo Seguro (`AnimatePresence`):** ¿Los elementos condicionales que tienen animaciones de salida (`exit`) están correctamente envueltos en un componente `<AnimatePresence>`?
4. **Optimización de Filtros y Ordenamiento:** ¿Las tablas y listados dinámicos aprovechan la propiedad `layout` en `<motion.tbody>` y `<motion.tr>` para reordenar filas con transiciones orgánicas?
5. **Accesibilidad (Reduced Motion):** ¿El código verifica activamente la configuración `prefers-reduced-motion` del usuario (usando `useReducedMotion`) para desactivar el movimiento si es necesario?

### RESULTADO ESPERADO
- **Análisis de Rendimiento y Movimiento:** (Identifica si hay saltos toscos, retrasos o animaciones excesivamente lentas).
- **Código Refactorizado A11y-First:** (El código completo corregido e integrado con controles de movimiento reducido y presets aprobados).
```
