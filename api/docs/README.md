# UECG Backend — Índice de Documentación

> Sistema de gestión académica para la Unidad Educativa Che Guevara.
> Backend: NestJS v11 + Prisma v7 + PostgreSQL + Redis

---

## 📋 Estado del Proyecto

| Archivo | Descripción |
|---|---|
| [PROJECT_STATE.md](../PROJECT_STATE.md) | Estado actual, módulos completos/incompletos, riesgos técnicos, deuda técnica y prioridades |

---

## 🏗️ Arquitectura

| Documento | Descripción |
|---|---|
| [architecture/overview.md](architecture/overview.md) | Visión general, capas, flujo de request, InfrastructureModule, EventEmitter, BullMQ |


---

## 🗄️ Base de Datos

| Documento | Descripción |
|---|---|
| [database/architecture-review.md](database/architecture-review.md) | Auditoría profunda de base de datos, score de arquitectura, riesgos críticos (DataUpdateRequest bug, cascade deletes) y análisis de escalabilidad a 10x/100x |
| [database/future-features.md](database/future-features.md) | Propuesta de dashboards, auditoría pedagógica de notas, alertas QR en tiempo real y flujos automatizados |

---

## 📦 Módulos

| Documento | Descripción |
|---|---|
| [modules/inventory.md](modules/inventory.md) | Inventario completo de todos los módulos, sus endpoints y estado |

---

## 📐 Convenciones

| Documento | Descripción |
|---|---|
| [conventions/coding-standards.md](conventions/coding-standards.md) | Naming, estructura de módulos, formato de respuesta, logging, transacciones |
| [conventions/dto-strategy.md](conventions/dto-strategy.md) | Estrategia de DTOs, validaciones, class-validator, paginación |

---

## 🔐 Seguridad

| Documento | Descripción |
|---|---|
| [security/auth-flow.md](security/auth-flow.md) | Flujo completo de autenticación JWT, cookies, ABAC, permisos, integración frontend |
| [security/data-security.md](security/data-security.md) | Encriptación PII, bcrypt, variables de entorno, firebase credentials |

---

## 🌐 API

| Documento | Descripción |
|---|---|
| [api/swagger-strategy.md](api/swagger-strategy.md) | Estrategia Swagger, decoradores obligatorios, tags del sistema |

---

## 🔌 Integración

| Documento | Descripción |
|---|---|
| [integration/frontend-integration.md](integration/frontend-integration.md) | Guía completa de integración React+Vite, tipos TypeScript, flujos de auth, endpoints por funcionalidad |

---

## 🤖 AI Context Files (`.ai/`)

| Archivo | Descripción |
|---|---|
| [project-context.md](../.ai/project-context.md) | **LEER PRIMERO** — Contexto de dominio, stack, vocabulario, patrones, instrucciones para agentes |
| [backend-rules.md](../.ai/backend-rules.md) | Reglas absolutas: prohibiciones y restricciones arquitecturales |
| [forbidden-patterns.md](../.ai/forbidden-patterns.md) | Anti-patrones detectados con correcciones |
| [api-rules.md](../.ai/api-rules.md) | Estándares HTTP, URL conventions, rate limits, manejo de errores |
| [integration-rules.md](../.ai/integration-rules.md) | Contratos inmutables frontend↔backend, cambios breaking vs non-breaking |
| [workflow.md](../.ai/workflow.md) | Flujo de trabajo: crear endpoint, modificar schema, comandos, CI checklist |

---

## 💬 Prompts para Agentes IA (`prompts/`)

| Prompt | Cuándo Usar |
|---|---|
| [create-module.md](../prompts/create-module.md) | Crear un nuevo módulo NestJS completo |
| [review-module.md](../prompts/review-module.md) | Auditar un módulo existente |
| [security-review.md](../prompts/security-review.md) | Auditoría de seguridad de un componente |
| [api-review.md](../prompts/api-review.md) | Revisar contratos de API y documentación Swagger |
| [integration-review.md](../prompts/integration-review.md) | Verificar compatibilidad frontend↔backend |

---

## 🔗 Links Rápidos de Desarrollo

- **Swagger UI:** `http://localhost:4000/api/docs`
- **API Base URL:** `http://localhost:4000/api/v1`
- **Prisma Studio:** `npx prisma studio`
- **Schema Prisma:** [`prisma/schema/schema.prisma`](../prisma/schema/schema.prisma)
- **Permisos ABAC:** [`src/auth/constants/permissions.constant.ts`](../src/auth/constants/permissions.constant.ts)
- **Bootstrap de la App:** [`src/main.ts`](../src/main.ts)

---

## 📅 Historial de Cambios Documentales

| Fecha | Cambio |
|---|---|
| 2026-05-26 | Creación completa de infraestructura documental basada en análisis del codebase |
