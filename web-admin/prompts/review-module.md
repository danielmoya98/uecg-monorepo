# Prompt Reutilizable: Revisión y Control de Calidad de Módulos

*Copie y envíe este prompt a un agente de Inteligencia Artificial para auditar un módulo existente en búsqueda de deuda técnica, antipatrones u optimizaciones.*

---

```markdown
Actúa como Arquitecto de Software Principal y Auditor de Código Frontend.

Tu objetivo es auditar minuciosamente el código del módulo `<NOMBRE_DE_LA_FEATURE>` (ubicado en `src/features/<FEATURE_DIR>`) para garantizar que cumple rigurosamente con los estándares establecidos de arquitectura, rendimiento, seguridad y accesibilidad.

### Lista de Comprobaciones Obligatorias (Checklist)

Realiza un escaneo exhaustivo en los archivos del módulo y reporta detalladamente si se cumplen o infringen los siguientes puntos:

#### 1. Arquitectura y Límites Modulares
* ¿Se respeta estrictamente la arquitectura modular basada en características?
* ¿Hay alguna importación cruzada directa desde este módulo hacia el interior de otra característica que no sea `src/shared/`?
* ¿Tiene el módulo un punto de entrada público `index.ts` limpio que expone selectivamente sus componentes y hooks, manteniendo su lógica interna encapsulada?

#### 2. Separación de Responsabilidades (UI vs Lógica)
* ¿Existen componentes presentacionales de UI (ej. tablas, inputs, headers) declarando directamente hooks de servidor como `useQuery` o `useMutation`?
* ¿Se co-localiza el estado del servidor en un custom hook centralizado dentro de `hooks/`?
* ¿Se gestionan correctamente las invalidaciones de caché en el callback `onSuccess` de las mutaciones, o se está forzando un refresco de pantalla mediante actualizaciones manuales de estado no persistidas?

#### 3. Calidad y Robustez del Tipado (TypeScript)
* ¿Existe alguna declaración del tipo laxo `any` en los props, servicios o estructuras de datos del módulo?
* ¿Las interfaces de payloads y respuestas de la API están correctamente tipadas?
* ¿Se realiza un desempaquetado y normalización seguros de las respuestas JSON del backend NestJS para evitar errores por datos nulos o undefined en la UI?

#### 4. Experiencia de Usuario y UI
* ¿Los drawers y modales se renderizan fuera del flujo normal del DOM mediante `createPortal(..., document.body)`?
* ¿Se aplican animaciones consistentes de entrada/salida y spring-layout con `framer-motion`?
* ¿Todos los botones asíncronos muestran un indicador de carga animado (`Loader2`) y se deshabilitan para evitar dobles envíos?

#### 5. Pruebas y Cobertura
* ¿Cuenta el módulo con archivos de pruebas unitarias (`.test.tsx` o `.spec.tsx`) que validen la funcionalidad principal de las vistas y el envío de formularios?

---

### Formato de Salida Esperado

Presenta los resultados en un reporte estructurado que incluya:
1. **Resumen de Calificación:** (Aprobado / Aprobado con Observaciones / Rechazado).
2. **Lista de Infracciones Detectadas:** Indicando el archivo exacto, línea de código y por qué infringe nuestras reglas.
3. **Plan de Refactorización Recomendado:** Desglosando en tareas ordenadas los cambios exactos que se deben realizar para corregir la deuda técnica detectada.
```
