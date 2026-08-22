# PROJECT_STATE.md — UECG Backend
> Última actualización: 2026-05-26 | Generado por análisis automático del codebase

---

## 📊 Resumen Ejecutivo

**Sistema:** Backend API REST para Unidad Educativa Che Guevara (UECG)  
**Framework:** NestJS v11 + Prisma v7 + PostgreSQL  
**Estado General:** 🟡 **EN DESARROLLO ACTIVO** — Núcleo funcional, expansión en curso  
**URL Base:** `http://localhost:4000/api/v1`  
**Docs Swagger:** `http://localhost:4000/api/docs`

---

## ✅ Módulos Completos (Production-Ready)

| Módulo | Ruta | Estado | Notas |
|---|---|---|---|
| `auth` | `/api/v1/auth` | ✅ Completo | JWT + Refresh Tokens + Lockout + FCM |
| `infrastructure` | — | ✅ Completo | Redis, BullMQ, EventEmitter, ConfigModule |
| `common` | — | ✅ Completo | Filtros, Interceptores, Encryption |
| `prisma` | — | ✅ Completo | Wrapper singleton global |
| `users` | `/api/v1/users` | ✅ Completo | ABAC + Encryption PII |
| `institutions` | `/api/v1/institutions` | ✅ Completo | RUE + Datos geográficos + DTO Hardening + Jest Unit Tests |
| `academic-years` | `/api/v1/academic-years` | ✅ Completo | Gestión ciclos lectivos |
| `classrooms` | `/api/v1/classrooms` | ✅ Completo | Unique constraint Level+Grade+Section+Shift + Jest Unit Tests |
| `subjects` | `/api/v1/subjects` | ✅ Completo | Catálogo global por nivel educativo |
| `teacher-assignments` | `/api/v1/teacher-assignments` | ✅ Completo | 1 materia = 1 docente por curso |
| `class-periods` | `/api/v1/class-periods` | ✅ Completo | Periodos fijos con breaks |
| `timetables` | `/api/v1/timetables` | ✅ Completo | Reglas oro: sin solapamientos |
| `students` | `/api/v1/students` | ✅ Completo | RUDE + Transacciones ACID |
| `enrollments` | `/api/v1/enrollments` | ✅ Completo | Estados FSM (REVISION_SIE→INSCRITO) |
| `guardians` | `/api/v1/guardians` | ✅ Completo | Tutores reutilizables |
| `trimesters` | `/api/v1/trimesters` | ✅ Completo | Control apertura/cierre trimestral |
| `attendance` | `/api/v1/attendance` | ✅ Completo | QR + Manual + Bulk + Justificaciones |
| `grades` | `/api/v1/grades` | ✅ Completo | SER/SABER/HACER/AUTO + Change Requests |
| `identity` | `/api/v1/identity` | ✅ Completo | Carnets QR + BullMQ Processor |
| `dashboard` | `/api/v1/dashboard` | ✅ Completo | Root/Global/Docente + Redis Cache |
| `audit` | `/api/v1/audit` | ✅ Completo | Log de acciones con interceptor |
| `reports` | `/api/v1/reports` | ✅ Completo | PDF + BullMQ Processor |
| `realtime` | `/api/v1/realtime` | ✅ Completo | SSE (Server-Sent Events) seguro + Heartbeat |
| `notifications` | — | ✅ Completo | Firebase Push + Queue |
| `mail` | — | ✅ Completo | Nodemailer OTP recovery |

---

## 🟡 Módulos Incompletos / En Progreso

| Módulo | Ruta | Estado | Problema |
|---|---|---|---|
| `physical-spaces` | `/api/v1/physical-spaces` | 🟡 Básico | Sin integración completa al horario |
| `data-updates` | `/api/v1/data-updates` | 🟡 Parcial | Flujo de actualización de datos RUDE pendiente |
| `queues` | — | 🟡 Parcial | Carpeta existe pero contenido en módulos individuales |

---

## 🔴 Riesgos Técnicos Críticos

### RIESGO 1 — [MITIGADO ✅] Debug `console.log` en Producción
**Estado:** Resuelto y limpio en el código real de `src/auth/auth.controller.ts`. No hay logs de debug del login body en el código productivo.

### RIESGO 2 — `user: any` en Firmas de Servicios 🚨
**Ubicación:** Múltiples servicios (`attendance`, `grades`, `users`, `enrollments`)  
**Impacto:** Sin tipado, el compilador no detecta propiedades inválidas en `user.userId`, `user.role`, `user.permissions`  
**Patrón correcto:**
```typescript
// ❌ Actual
async saveBulkAttendance(dto: any, user: any)

// ✅ Objetivo
interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}
async saveBulkAttendance(dto: SaveBulkAttendanceDto, user: AuthenticatedUser)
```

### RIESGO 3 — [MITIGADO ✅] JWT Secret en Fallback Hardcodeado
**Estado:** Resuelto in `src/auth/strategies/jwt.strategy.ts` mediante el uso de `configService.getOrThrow<string>('JWT_SECRET')`. Si el secret no está configurado, el servidor no arranca, evitando fallbacks inseguros.

### RIESGO 4 — Duplicación de Lógica de Score en Grades 🔴
**Ubicación:** `grades.service.ts` — Misma lógica de cálculo (SER+SABER+HACER+AUTO) duplicada en `upsertGrade()`, `updateBulkGrades()` and `resolveChangeRequest()`  
**Impacto:** Deuda técnica, inconsistencias futuras  
**Acción:** Extraer a método privado `calculateGradeScores()`

### RIESGO 5 — Logout no invalida token de acceso ⚠️
**Ubicación:** `src/auth/auth.controller.ts` — `logout()` solo borra cookie, no invalida el JWT activo  
**Impacto:** Token válido hasta expiración (15 min) puede reutilizarse post-logout  
**Mitigación actual:** Cookie httpOnly mitiga el riesgo, pero el token sigue válido si fue capturado

### RIESGO 6 — Schema Prisma diverge del contexto_backend.md ⚠️
**Descripción:** `contexto_backend.md` muestra un schema con Roles simples como enum (`ADMIN`, `DOCENTE`), pero el código real usa un modelo `Role` relacional con `Permission` y `RolePermission`. El documento está desactualizado.

---

## 🔧 Deuda Técnica

### Alta Prioridad
- [x] **Eliminar `console.log` de debug** en `auth.controller.ts` (Validado en auditoría)
- [ ] **Crear interfaz `AuthenticatedUser`** y reemplazar todos los `user: any`
- [x] **Eliminar fallback hardcodeado** en JWT secret (Validado en auditoría)
- [ ] **Extraer cálculo de notas** a función privada reutilizable en `grades.service.ts`
- [ ] **Actualizar `contexto_backend.md`** o reemplazarlo con esta documentación

### Media Prioridad
- [ ] **Agregar `@CurrentUser()` decorator** global en `src/common/decorators/`
- [ ] **Tipar respuestas de servicios** con interfaces/DTOs explícitos en lugar de `any`
- [/] **Agregar `@ApiResponse()` decorators** en todos los controllers para Swagger completo (Completado para UsersController)
- [ ] **Agregar `@IsUUID()` validations** en todos los parámetros de ruta `id`
- [x] **Tests unitarios** — Implementado con Jest (añadidos 5 tests unitarios para perfil en UsersService)
- [ ] **Separar lógica de cookie** del controller a un helper dedicado

### Baja Prioridad
- [ ] **Mejorar manejo de timezone** — Resuelto en `attendance` vía `getSafeLocalDate()`, aún pendiente unificar en otros módulos.
- [ ] **Documentar `physical-spaces`** — Módulo sin documentación clara de propósito
- [ ] **Revisar `data-updates`** — Propósito no completamente claro desde el código


---

## 🏗️ Prioridades de Desarrollo

### Sprint Actual (Crítico)
1. Eliminar debug logs de producción
2. Crear type `AuthenticatedUser` y aplicarlo en todos los servicios
3. Hardening de JWT (sin fallback)

### Próximo Sprint
4. Tests unitarios para `grades.service.ts` y `auth.service.ts`
5. Swagger completo con `@ApiResponse` en todos los controllers
6. `@CurrentUser()` decorator global

### Backlog
7. Completar `physical-spaces` e integración con horarios
8. Revisar y completar `data-updates`
9. Estrategia de invalidación de tokens en logout
10. Migración a monorepo si el proyecto escala a múltiples apps

---

## 📦 Inventario de Dependencias Clave

| Dependencia | Versión | Propósito |
|---|---|---|
| `@nestjs/core` | 11.1.13 | Framework principal |
| `@prisma/client` | 7.3.0 | ORM + PostgreSQL |
| `@nestjs/jwt` | 11.0.2 | JWT access + refresh tokens |
| `@nestjs/passport` | 11.0.5 | Estrategia JWT stateless |
| `@nestjs/bullmq` | 11.0.4 | Colas asíncronas (PDF, Push, Notifs) |
| `@nestjs/cache-manager` | 3.1.0 | Cache Redis |
| `@nestjs/swagger` | 11.2.6 | OpenAPI auto-docs |
| `@nestjs/event-emitter` | 3.1.0 | Bus de eventos de dominio |
| `firebase-admin` | 13.8.0 | Push Notifications (FCM) |
| `@casl/ability` | 6.8.1 | CASL (instalado pero no en uso activo) |
| `bcrypt` | 6.0.0 | Hash contraseñas + refresh tokens |
| `helmet` | 8.1.0 | Headers de seguridad HTTP |
| `zod` | 4.3.6 | Instalado, no en uso activo actualmente |

---

## 🔐 Modelo de Seguridad Actual

```
Request → Helmet → CORS → ThrottlerGuard (rate limit) 
       → JwtAuthGuard (passport-jwt, cookie + bearer)
       → PermissionsGuard (ABAC: action:scope:Subject)
       → Controller → Service → Prisma
Response → AllExceptionsFilter → ResponseInterceptor
```

**Roles del sistema (DB dinámica, no enum):**
- `SUPER_ADMIN` → `manage:all:all` (acceso root total)
- `DIRECTOR` → Permisos administrativos excepto User/Role/Institution/Audit
- `DOCENTE` → Solo permisos `own` (sus materias, sus horarios, su dashboard)
- `PADRE` → `read:own:Guardian` (App móvil)
- `ESTUDIANTE` → Acceso móvil limitado

---

## 🌐 Integración Frontend

**Frontend:** React + Vite (migración incremental)  
**Auth Strategy:** HttpOnly Cookies (`uecg_access_token` 15min + `uecg_refresh_token` 7d)  
**Respuesta estándar:**
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```
**Error estándar:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "El registro solicitado no existe"
  }
}
```
