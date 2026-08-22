# Prompt: Auditoría de Arquitectura y Modularidad (component-review.md)

Este prompt audita la estructura y modularidad de los componentes de React, certificando el desacoplamiento de la interfaz frente a la lógica asíncrona de red, la correcta co-colocación de ficheros y la robustez de TypeScript.

---

## Instrucciones de Uso

Copia y pega el bloque inferior en tu chat con la IA cuando desees revisar la arquitectura y cohesión interna de un componente o módulo.

```markdown
Actúa como Principal Software Architect e Ingeniero de Sistemas de Diseño.

Audita la modularidad y el diseño de componentes en el siguiente código para certificar que cumple con los estándares arquitectónicos del proyecto.

### CÓDIGO A AUDITAR
[Pega el código del componente o ruta del archivo aquí]

### DIRECTIVAS DE ARQUITECTURA A AUDITAR
1. **Desacoplamiento UI de Red (UI Decoupling):** ¿El componente inyecta consultas de TanStack Query (`useQuery` / `useMutation`) directamente en elementos presentacionales visuales (como cabeceras, celdas de tabla o toolbar)? (Toda lógica asíncrona debe aislarse en custom hooks específicos).
2. **Consistencia de Tipos en TypeScript:** ¿El código utiliza tipos débiles como `any` o elude al compilador con comentarios `@ts-ignore`? (Se requiere tipado estricto e interfaces claras para todas las Props).
3. **Reutilización y Duplicidad:** ¿El archivo duplica componentes comunes (como selectores desplegables o inputs estilizados) en lugar de importar elementos compartidos globales de `src/shared/ui/`?
4. **Co-localización Estricta:** ¿Los componentes y ficheros auxiliares se encuentran almacenados en el módulo correcto o pertenecen a otro feature?
5. **Compatibilidad con Gestores de Formularios:** ¿Los controles de entrada reutilizables están adecuadamente envueltos en `React.forwardRef` para un enlazado limpio con React Hook Form?

### RESULTADO ESPERADO
- **Errores Arquitectónicos y Cohesión:** (Diagnóstico detallado de acoplamiento de red, tipos débiles y duplicidades).
- **Plan de Segregación de Código:** (Guía paso a paso para separar la lógica del presentador).
- **Componentes Refactorizados Limpios:** (Propuesta de código desacoplado y co-localizado perfectamente estructurado).
```
