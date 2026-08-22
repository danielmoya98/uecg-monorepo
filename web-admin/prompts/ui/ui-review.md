# Prompt: Auditoría General UI/UX (ui-review.md)

Este prompt está diseñado para auditar de forma integral cualquier archivo de interfaz de usuario (componente, hook, página) del proyecto, evaluando el cumplimiento estricto del sistema de diseño, accesibilidad, performance, movimiento y responsive.

---

## Instrucciones de Uso

Copia y pega el bloque inferior en tu chat con la IA cuando desees revisar la calidad UI/UX de uno o más archivos de código.

```markdown
Actúa como Principal UI/UX Architect y Design System Maintainer. 

Tu tarea es realizar una auditoría exhaustiva y rigurosa del siguiente código frente a las directivas del sistema de diseño suizo y la paleta Obsidian Slate.

### CÓDIGO A AUDITAR
[Pega el código del componente o ruta del archivo aquí]

### CRITERIOS DE EVALUACIÓN
1. **Adhesión Visual (Estilo Suizo):** ¿El componente utiliza esquinas totalmente cuadradas (`rounded-none`) y bordes geométricos (`border-uecg-line`)? ¿Existe algún color hardcodeado no autorizado?
2. **Accesibilidad (WCAG 2.1 AA):** ¿Los formularios implementan de forma nativa `aria-invalid` y `aria-describedby`? ¿Todos los botones gráficos contienen `aria-label`? ¿Los diálogos implementan focus trapping y escape?
3. **Estrategia de Carga:** ¿El componente maneja estados asíncronos con Skeletons planos en lugar de spinners globales? ¿Se implementan de forma correcta los loader de acción en botones durante peticiones de servidor?
4. **Estrategia de Movimiento:** ¿Los sliders de Drawer consumen los presets de física de resorte (`spring`) exactos? ¿Los dropdowns usan transiciones ultrarrápidas (`duration: 0.12` a `0.15` con `easeOut`)?
5. **Estructura y Responsive:** ¿Los filtros e inputs son adaptativos en móviles? ¿Las tablas tienen desbordamiento horizontal controlado?
6. **Patrones Prohibidos:** ¿Existen divs clickables sin roles ARIA? ¿Hay estilos inline no autorizados o lógica de datos de red inyectada de forma inline en la UI?

### RESULTADO ESPERADO
Genera un informe descriptivo y constructivo estructurado de la siguiente forma:
- **Resumen del Diagnóstico:** (Puntuación de 1 a 10 y breve valoración general).
- **Lista de Violaciones Detectadas:** (Agrupadas por severidad: Crítica, Media, Leve).
- **Propuesta de Refactorización:** (El código completo corregido, optimizado y documentado).
```
