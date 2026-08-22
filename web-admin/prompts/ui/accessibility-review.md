# Prompt: Auditoría de Accesibilidad - WCAG 2.1 AA (accessibility-review.md)

Este prompt ejecuta una evaluación exhaustiva sobre el cumplimiento de los estándares de accesibilidad **WCAG 2.1 AA** en los componentes del proyecto.

---

## Instrucciones de Uso

Copia y pega el bloque inferior en tu chat con la IA cuando desees validar que tus componentes sean 100% accesibles e inclusivos.

```markdown
Actúa como Principal Accessibility Specialist (A11y Auditor) y consultor WCAG 2.1.

Tu tarea es auditar minuciosamente el siguiente componente de React para garantizar que cumple rigurosamente con el nivel **AA** de las directivas de accesibilidad WCAG 2.1.

### CÓDIGO A AUDITAR
[Pega el código del componente o ruta del archivo aquí]

### CHECKLIST DE ACCESIBILIDAD A AUDITAR
1. **Semántica Correcta:** ¿El componente recurre a etiquetas `div` o `span` con eventos `onClick` directos sin proveer semántica? (Se deben usar botones semánticos `<button type="button">` o enlaces `<a>`).
2. **Conexión de Error en Formularios:** ¿Los campos de entrada fallidos mapean la propiedad `aria-invalid="true"` y se vinculan a su error de texto a través de `aria-describedby`?
3. **Control del Foco (Focus Trapping):** Si el componente es un Drawer lateral deslizante o un diálogo emergente, ¿posee un escuchador en su ciclo de vida para evitar que la tecla `Tab` escape al fondo de la pantalla?
4. **Cierre por Teclado:** ¿Los diálogos y menús contextuales interceptan de forma global la tecla `Escape` para cerrarse de forma incondicional?
5. **Restauración del Enfoque (Focus Restoration):** Al cerrarse un modal o cajón, ¿el foco es devuelto limpiamente al botón o enlace que lo activó?
6. **Contraste e Indicadores de Foco:** ¿Los botones e inputs conservan contornos de enfoque visibles al ser seleccionados mediante el teclado (`focus:border-uecg-blue` o similar)?

### RESULTADO ESPERADO
- **Errores de Accesibilidad Detectados:** (Lista numerada enlazando las violaciones directamente con las directrices WCAG 2.1 AA).
- **Código Refactorizado 100% Accesible:** (Código limpio e integrado con focus traps nativos, enlaces ARIA y semántica nativa).
```
