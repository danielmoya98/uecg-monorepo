# Prompt: Auditoría de Skeletons y Estados de Carga (loading-review.md)

Este prompt audita de forma específica la experiencia del usuario durante operaciones de red asíncronas, garantizando que el flujo visual no sufra saltos bruscos (`Layout Shifts`) y consuma skeletons y estados optimistas de alta fidelidad.

---

## Instrucciones de Uso

Copia y pega el bloque inferior en tu chat con la IA cuando desees analizar y optimizar la UX de carga en tus componentes.

```markdown
Actúa como Principal Frontend Architect experto en Web Performance y UX Asíncrona.

Audita el siguiente componente y sus hooks de datos asociados para certificar que la experiencia de carga asíncrona sea de primer nivel.

### CÓDIGO A AUDITAR
[Pega el código del componente o ruta del archivo aquí]

### DIRECTIVAS DE CARGA A EVALUAR
1. **Evitar Spinners de Bloqueo:** ¿El componente bloquea toda la pantalla o sufre de parpadeos vacíos? (Se deben usar skeletons del mismo tamaño y forma de la rejilla final).
2. **Estética Suiza de Skeletons:** ¿Los skeletons propuestos tienen bordes rectos (`rounded-none`), color plano de contraste (`bg-gray-200` / `bg-zinc-800`) y parpadeo controlado (`animate-pulse`)?
3. **Indicadores Compactos de Acción:** En las acciones de formulario (botones de guardar o eliminar), ¿se desactiva el botón y se inyecta un loader de progreso giratorio (`Loader2` animado)?
4. **Actualizaciones Optimistas:** En operaciones binarias simples (ej. habilitar/deshabilitar estados), ¿se pinta el resultado antes de confirmar la petición con el servidor (Optimistic UI) para una respuesta táctil instantánea?

### RESULTADO ESPERADO
- **Análisis de UX de Carga:** (Detalla dónde ocurren saltos bruscos de diseño, pantallas blancas o loaders redundantes).
- **Código Optimizado con Skeletons y Loader:** (Propuesta de refactorización incorporando skeletons estructurados y deshabilitaciones seguras).
```
