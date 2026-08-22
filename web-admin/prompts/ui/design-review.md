# Prompt: Auditoría de Diseño Visual y Colores (design-review.md)

Este prompt evalúa la consistencia de estilos estéticos, colores de la paleta Obsidian Slate y el cumplimiento estricto del **Estilo Suizo (Swiss Design)** en el código del frontend.

---

## Instrucciones de Uso

Copia y pega el bloque inferior en tu chat con la IA cuando desees evaluar la fidelidad estética y visual de tus componentes.

```markdown
Actúa como Guardián del Sistema de Diseño (Design System Maintainer).

Tu objetivo es auditar el siguiente código y evaluar el estricto cumplimiento estricto del **Estilo Suizo** y la paleta Obsidian Slate en Tailwind CSS v4.

### CÓDIGO A AUDITAR
[Pega el código del componente o ruta del archivo aquí]

### REGLAS DE AUDITORÍA ESTÉTICA
1. **Regla del Rectángulo Puro:** ¿Existe alguna clase `rounded`, `rounded-md` o similar en componentes, tarjetas, selectores o inputs? (Debe ser `rounded-none` o omitido, excepto en avatares).
2. **Hilos sobre Sombras:** ¿El espaciado y la separación visual están hechos con hilos (`border-uecg-line`) o se han utilizado sombras anchas y borrosas?
3. **Consumo Cromático:** ¿Se usan colores crudos hexadecimales (`#ff0000`) o clases de Tailwind no autorizadas (como `bg-emerald-500`) en lugar de variables semánticas (`bg-background`, `border-uecg-line`, `bg-uecg-blue`)?
4. **Tratamiento de Textos:** ¿Las etiquetas, botones y cabeceras de tabla usan mayúsculas (`uppercase`) acompañadas de separación de caracteres (`tracking-widest` o `tracking-wider`)?
5. **Composición de Rejilla:** ¿Los componentes compuestos tipo cuadrícula o listado implementan el patrón `swiss-grid` y `swiss-cell` para un aspecto técnico?

### RESULTADO ESPERADO
Genera un análisis constructivo:
- **Violaciones Estéticas:** (Puntos que rompen la homogeneidad visual).
- **Plan de Corrección:** (Acciones concretas para alinearlo al estilo corporativo).
- **Código Refactorizado:** (Propuesta de código limpio, 100% libre de antipatrones estéticos).
```
