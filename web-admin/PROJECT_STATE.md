# Estado de Migración del Proyecto (PROJECT_STATE.md)

Este documento es una bitácora viva que registra el estado de avance de la migración de Next.js a React + Vite, clasificando la madurez de los módulos, los riesgos técnicos latentes y las prioridades de ingeniería inmediatas.

## 1. Tablero de Avance por Módulos (Features)

| Característica (Feature) | Estado de Migración | Calidad de Tipado | Co-localización Hooks | Cobertura Tests | Notas Técnicas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`auth`** (Sesión/Token) | **100% Migrado** | Alta | Completa | 0% | Interceptores automáticos y JWT seguros funcionales. |
| **`academic-years`** | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Estilo Suizo. Desacoplado con portales, AnimatePresence, focus-trap, escape, Zod, RHF y paginación corregida. |
| **`institutions`** | **100% Migrado** | Alta (Estricto) | Completa | 0% | Estilo Suizo. Desacoplado, 100% libre de lógica inline en UI, Zod schemas, RHF, SwissSelect accesible (WCAG 2.1 AA), sin any. |
| **`dashboard`** (Widgets) | **100% Migrado** | Alta | Completa | 0% | Panel de métricas e informes adaptado a Vite. |
| **`profile`** (Ajustes) | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Estilo Suizo. Desacoplado con portales, AnimatePresence, focus lock, Escape, Zod, RHF y 100% libre de lógica inline en UI. |
| **`audit`** (Trazabilidad) | **100% Migrado** | Alta (Estricto) | Completa | 0% | Trazabilidad global, búsqueda interactiva, debounced search, refresco en vivo (15s) con loader visual y accesibilidad WCAG 2.1. |
| **`rbac`** (Roles/Permisos) | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Roles y Matriz global, Zod, React Hook Form, A11y WCAG 2.1 con atajo CTRL+K, focus-within e inmunidad a loops y visual bypasses. |
| **`users`** (Usuarios) | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Paginación y filtros reactivos, debounced search, atajo CTRL+K, React Hook Form, validación Zod, renderizado perezoso, credenciales PDF con `@react-pdf/renderer` y portales en Drawer. |
| **`classrooms`** (Ajustes) | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Creación masiva por lotes y individual con portales reactivos y focus traps, filtros y buscador CTRL+K, custom selector suizo, idempotencia. |
| **`subjects`** (Materias) | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Catálogo de materias en Lista y Cuadrícula, buscador CTRL+K, SwissSelect accesible, co-localización estricta, portales con framer-motion en drawer. |
| **`teacher-assignments`** | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Panel de carga horaria (vinculación materias/docentes), selector lateral de aulas, drawers interactivos con portal, animaciones spring fluidas, focus traps y tecla Escape, 100% libre de lógica en UI. |
| **`timetables`** (Horarios) | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Matriz interactiva de horarios, drag-and-drop con `@hello-pangea/dnd`, ABAC síncrono vía `useRouteContext` de TanStack, exportación blob en ZIP de lote maestro y descargas PDF, 100% libre de lógica inline en UI. |
| **`identity`** (Carnets) | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Centro de Carnetización e Identidad Digital, socket modularizado local, select accesible WCAG 2.1 AA, previsualizador PDF y descarga ZIP blob. |
| **`data-updates`** (Actualizaciones RUDE) | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Bandeja de entrada RUDE, comparación side-by-side (auditoría), motor omnicanal (avisos por curso y nuclear masivo) desacoplado en custom hooks, portales con Framer Motion, focus trap y Escape WCAG 2.1 AA, cero lógica en UI. |
| **`enrollments`** (Inscripciones) | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Bandeja administrativa de inscripciones y formulario RUDE manual de 4 pasos. ABAC síncrono en TanStack Router `beforeLoad`, co-localización en hooks, react-pdf perezoso, portales WCAG 2.1 AA en drawers. |
| **`reports`** (Libretas) | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Libreta de calificaciones Ley 070 (Comunitaria Vocacional) con traducción numérica literal en castellano, disparador masivo asíncrono con cola BullMQ, portales A11y WCAG 2.1 AA. |
| **`attendance`** (Asistencia) | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Monitoreo en vivo, pase de lista manual, estación QR biométrica, beeps de audio, licencias por portal Drawer A11y WCAG 2.1 AA con focus trap y escape, debounce. |
| **`grades`** (Calificaciones) | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Sábanas y registro de notas Ley 070, SwissSelect accesible, drawers descongelamiento con Portales reactivos, Focus Trap y Esc WCAG 2.1 AA. |
| **`class-periods`** | **100% Migrado** | Alta (Estricto) | Completa | 100% (Humo) | Módulo co-localizado en hooks y componentes independientes. Integración total con backend mediante mutación real de eliminación. |

---

## 2. Riesgos Técnicos y Brechas Arquitectónicas Detectadas

### R1. [MITIGADO ✅] Co-localización Violada en Periodos de Clase (`class-periods`)
* **Estado:** Resuelto. El componente `ClassPeriodsSettingsPanel` fue reubicado en `src/features/class-periods/components`, la lógica HTTP se delegó en el hook customizado `useClassPeriodsData` y se implementó la mutación real de borrado `removeMutation.mutate(p.id)` llamando al backend REST de manera definitiva.


### R2. [MITIGADO ✅] Deuda de Tipado Laxo (`any` usage)
* **Impacto:** Ninguno (Resuelto)
* **Descripción:** Se habilitó `"strict": true` de forma global en `tsconfig.app.json` y se eliminaron por completo las discrepancias y tipos `any` en la tabla, barra de herramientas y cajones del módulo `academic-years` (y corregido para retrocompatibilidad con llamadas genéricas).

### R3. Cero Cobertura de Pruebas Unitarias (0% Test Coverage)
* **Impacto:** Alto (Fragilidad ante refactorizaciones)
* **Descripción:** El repositorio cuenta con `vitest` y `jsdom` instalados y configurados, pero no existe ni una sola prueba unitaria escrita para certificar la estabilidad de vistas y lógica de negocio.
* **Mitigación:** Configurar una batería de tests de humo y pruebas de renderizado en los formularios y hooks clave.

### R4. Boilerplate Masivo de Desempaquetado de Datos
* **Impacto:** Medio (Código duplicado / Mantenibilidad)
* **Descripción:** Más de 70 servicios individuales repiten manualmente el patrón `response.data.data !== undefined ? response.data.data : response.data` para desempaquetar la respuesta JSON de NestJS, en lugar de manejarlo centralmente en el interceptor de Axios.
* **Mitigación:** Agregar un interceptor de respuesta en `src/shared/api/client.ts` que automáticamente resuelva e inserte el objeto `data` real, eliminando el boilerplate de los servicios.

---

## 3. Hoja de Ruta y Prioridades de Ingeniería

Aprobado el plan de infraestructura de contexto, las siguientes acciones deben ejecutarse en orden secuencial de prioridad:

1. [COMPLETADO ✅] **Prioridad 1: Saneamiento de `class-periods`:** Mover la UI a su respectivo módulo, encapsular la lógica en `use-class-periods-data.ts`, añadir tipos estrictos e implementar la llamada de mutación HTTP real para el borrado de periodos.
2. [COMPLETADO ✅] **Prioridad 2: Activación progresiva de TypeScript Estricto:** Añadir `"strict": true` en `tsconfig.app.json` y resolver las discrepancias surgidas en `academic-years` y otros componentes.
3. [COMPLETADO ✅] **Prioridad 3: Creación de Pruebas de Humo:** Escribir las primeras pruebas unitarias con Vitest y `@testing-library/react` para los hooks y drawers de validación de `academic-years` y `auth`.
4. [COMPLETADO ✅] **Prioridad 4: Centralización del Desempaquetado de Datos:** Implementar el interceptor en Axios client y limpiar los servicios individuales del boilerplate.


