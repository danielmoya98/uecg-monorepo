# Registro de Decisiones de Arquitectura (ADRs)

Este documento registra las decisiones técnicas clave tomadas durante la migración e ingeniería de la plataforma UECG.

## ADR-001: Arquitectura Modular Basada en Características (Feature-Based)
* **Estado:** Aceptado
* **Contexto:** La migración desde Next.js requiere un modelo que permita la migración incremental y el desacoplamiento de componentes de manera segura.
* **Decisión:** Organizar el código en `src/features/[feature-name]` agrupando componentes, hooks, servicios API y esquemas del mismo dominio de negocio.
* **Consecuencias:** Excelente mantenibilidad, reducción de colisiones en Git y facilidad para que agentes de Inteligencia Artificial entiendan el contexto de una característica específica sin leer todo el proyecto.

---

## ADR-002: Enrutamiento Basado en Archivos con TanStack Router
* **Estado:** Aceptado
* **Contexto:** Necesitamos un enrutamiento de alto rendimiento con seguridad de tipos en enlaces y carga perezosa de vistas complejas.
* **Decisión:** Adoptar `@tanstack/react-router` configurando su directorio de generación de rutas en `src/app/router/`.
* **Consecuencias:** Enrutamiento 100% tipado en TypeScript, detección en tiempo de compilación de rutas rotas y división de código automática (`lazyRouteComponent`).

---

## ADR-003: Separación de Estados con TanStack Query y Zustand
* **Estado:** Aceptado
* **Contexto:** La gestión tradicional de estado (Redux o Contexts genéricos) causa acoplamiento y re-renders masivos al mezclar datos de servidor con variables locales de UI.
* **Decisión:** 
  1. Todo el estado del servidor (solicitudes, caché, invalidación, carga, errores) se delega a TanStack Query (`@tanstack/react-query`).
  2. El estado del cliente puramente global (sesión de usuario) se gestiona en tiendas minimalistas de Zustand (`zustand`).
* **Consecuencias:** Código altamente reactivo, optimización drástica de rendimiento y reducción de la necesidad de disparar peticiones manuales en efectos de React (`useEffect`).

---

## ADR-004: Validación del Lado del Cliente con React Hook Form y Zod
* **Estado:** Aceptado
* **Contexto:** Los formularios del sistema requieren un control exhaustivo de errores en tiempo real y una conversión fiable de tipos de entrada.
* **Decisión:** Combinar `react-hook-form` con esquemas de validación de `zod` mediante el resolvedor oficial.
* **Consecuencias:** Validación reactiva, reducción drástica del código repetitivo de validación manual y tipos inferidos directamente desde el esquema del formulario.

---

## ADR-005: Eliminación Gradual de `any` y Habilitación de TypeScript Estricto
* **Estado:** Aceptado (En ejecución)
* **Contexto:** El uso del tipo `any` en archivos heredados compromete la seguridad y causa errores inesperados en tiempo de ejecución.
* **Decisión:** Prohibir el uso de `any` en nuevos módulos y habilitar de manera progresiva el tipado estricto en el compilador.
* **Consecuencias:** Código autodocumentado, detección temprana de errores y predictibilidad del flujo de datos en el frontend.

---

## ADR-006: Desacoplamiento de Portales Drawer y Desempaquetado Centralizado de API
* **Estado:** Aceptado
* **Contexto:** Los cajones laterales (Drawers) y diálogos interactivos mezclaban consultas HTTP y mutaciones directamente en su lógica de renderizado, y los servicios API duplicaban lógica de desempaquetado de NestJS, perdiendo metadatos de paginación en el proceso.
* **Decisión:** 
  1. Extraer todas las consultas y mutaciones de los Drawers y moverlas a hooks de datos dedicados (ej. `useAcademicYearsData`, `useTrimestersData`).
  2. Implementar Drawers como componentes puramente presentacionales que acepten handlers y estados de carga mediante Props, inyectándolos dinámicamente mediante `createPortal(..., document.body)` y `AnimatePresence`.
  3. Eliminar el boilerplate manual de desempaquetado de DTOs en los servicios y delegarlo al interceptor de Axios, que propaga correctamente `{ data, meta }`.
* **Consecuencias:** Código presentacional limpio y testeable de forma aislada, mayor rendimiento por desmontado físico de componentes inactivos, accesibilidad WCAG 2.1 AA robusta (focus trapping, Escape key closing) y preservación correcta de metadatos de paginación.
