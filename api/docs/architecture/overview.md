# Arquitectura del Backend UECG

## Visión General

El backend UECG es una API REST modular construida sobre **NestJS v11** con **Prisma v7** como ORM y **PostgreSQL** como base de datos. Está diseñado para gestionar el sistema académico completo de una Unidad Educativa boliviana conforme al estándar SIE/RUE del Ministerio de Educación.

---

## Diagrama de Capas

```
┌────────────────────────────────────────────────────┐
│                  CLIENTE (React + Vite)             │
│              HTTP + HttpOnly Cookies               │
└────────────────┬───────────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────────┐
│               SEGURIDAD (Pipeline Global)           │
│  Helmet → CORS → Throttler → JWT Guard → Permissions│
└────────────────┬───────────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────────┐
│                  CONTROLLERS (Capa HTTP)             │
│  Reciben DTOs validados, delegan a Services         │
│  Manejan cookies, versioning URI (/api/v1/)         │
└────────────────┬───────────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────────┐
│                  SERVICES (Lógica de Negocio)        │
│  Orquestan queries Prisma, transacciones, eventos   │
│  Emiten eventos de dominio via EventEmitter2        │
└────────────────┬───────────────────────────────────┘
                 │
     ┌───────────┴──────────┐
     │                      │
┌────▼────┐          ┌──────▼──────┐
│ Prisma  │          │ Redis Cache │
│ (ORM)   │          │ + BullMQ    │
│PostgreSQL│         │ (Colas)     │
└─────────┘          └─────────────┘
```

---

## Módulo de Infraestructura (`InfrastructureModule`)

El módulo `@Global()` que inicializa todos los servicios transversales:

| Servicio | Config | Propósito |
|---|---|---|
| `ConfigModule` | `isGlobal: true` | Variables de entorno accesibles en toda la app |
| `EventEmitterModule` | `wildcard: true, delimiter: '.'` | Bus de eventos de dominio |
| `ScheduleModule` | — | Cron jobs (attendance auto-mark) |
| `ThrottlerModule` | 300 req/60s | Rate limiting global |
| `CacheModule` (Redis) | DB 0, TTL 60s | Cache de queries costosas |
| `BullModule` (Redis) | DB 1, prefix `{uecg-bull}` | Colas asíncronas |
| `PrismaModule` | — | Singleton del cliente Prisma |
| `FirebaseModule` | — | Admin SDK para Push Notifications |

---

## Flujo de Request Completo

```
POST /api/v1/attendance/bulk

1. cookie-parser      → extrae uecg_access_token del cookie
2. helmet             → añade security headers
3. CORS               → valida origin del frontend
4. ThrottlerGuard     → verifica rate limit
5. JwtAuthGuard       → valida JWT, popula req.user
6. PermissionsGuard   → verifica permission 'create:own:Attendance'
7. ValidationPipe     → valida y transforma DTO (whitelist: true)
8. AttendanceController → llama attendanceService.saveBulkAttendance()
9. AttendanceService  → verifica ABAC, ejecuta $transaction Prisma
10. EventEmitter       → emite 'attendance.bulk.registered'
11. AttendanceListener → encola notificaciones Push en BullMQ
12. ResponseInterceptor → wraps response en { success, message, data }
13. AllExceptionsFilter → captura errores, normaliza respuesta de error
```

---

## Estructura de Directorios

```
src/
├── main.ts                    # Bootstrap: Swagger, Guards globales, CORS, Versioning
├── app.module.ts              # Root module — importa todos los feature modules
│
├── infrastructure/            # @Global — Toda la infraestructura técnica
│   └── infrastructure.module.ts
│
├── common/                    # Utilidades transversales reutilizables
│   ├── configs/cors.config.ts
│   ├── dto/pagination.dto.ts
│   ├── filters/http-exception.filter.ts  # AllExceptionsFilter
│   ├── interceptors/
│   │   ├── response.interceptor.ts       # Wrapper { success, data, message }
│   │   ├── idempotency.interceptor.ts
│   │   └── user-profile-cache.interceptor.ts
│   └── services/encryption.service.ts   # AES para PII sensible
│
├── prisma/                    # Singleton del cliente Prisma
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── auth/                      # Autenticación y autorización
│   ├── auth.controller.ts     # Login, Logout, Refresh, SetupPassword, Recovery
│   ├── auth.service.ts        # Orquestador principal
│   ├── auth.module.ts
│   ├── auth.listener.ts       # Eventos de autenticación
│   ├── constants/permissions.constant.ts  # Enum SystemPermissions (ABAC)
│   ├── decorators/permissions.decorator.ts
│   ├── dto/                   # LoginDto, SetupPasswordDto, etc.
│   ├── guards/permissions.guard.ts
│   ├── strategies/jwt.strategy.ts
│   └── services/
│       ├── auth-token.service.ts    # JWT generation + bcrypt
│       ├── auth-password.service.ts # Setup + change password
│       ├── auth-recovery.service.ts # OTP recovery flow
│       ├── auth-mobile.service.ts   # Registro Guardian/Student (App)
│       ├── permissions-sync.service.ts
│       └── roles.service.ts         # CRUD roles + seed permissions
│
├── [feature-modules]/         # academic-years, classrooms, subjects...
│   ├── [module].controller.ts
│   ├── [module].service.ts
│   ├── [module].module.ts
│   └── dto/
│
└── [async-feature-modules]/   # attendance, grades, reports, identity...
    ├── [module].controller.ts
    ├── [module].service.ts
    ├── [module].module.ts
    ├── [module].processor.ts  # BullMQ Job Processor
    ├── [module].listener.ts   # EventEmitter Listener
    ├── [module].gateway.ts    # WebSocket (identity)
    └── dto/
```

---

## Versionado de API

- Tipo: **URI Versioning** (`VersioningType.URI`)
- Versión por defecto: **`1`**
- Prefijo global: **`/api`**
- URL efectiva: `https://domain.com/api/v1/{resource}`

## Configuración de CORS

Gestionado en `src/common/configs/cors.config.ts`. Permite credenciales para el flujo de cookies. Configurar correctamente los `origins` permitidos por entorno.

---

## Patrón de Eventos de Dominio

```typescript
// Producción del evento (en el Service)
this.eventEmitter.emit('attendance.qr.scanned', { enrollmentId, status });

// Consumo del evento (en el Listener)
@OnEvent('attendance.qr.scanned')
async handleQrScanned(payload: AttendanceQrScannedPayload) {
  await this.notificationsQueue.add('push-notification', payload);
}
```

Eventos activos en el sistema:
- `auth.login.success` / `auth.login.failed`
- `auth.account.locked`
- `auth.logout`
- `auth.refresh.success` / `auth.refresh.failed`
- `auth.fcm.registered`
- `attendance.bulk.registered`
- `attendance.qr.scanned`
- `attendance.manual.registered`

---

## Tecnología de Colas (BullMQ)

Las operaciones asíncronas pesadas y notificaciones diferidas se procesan mediante los siguientes jobs en BullMQ:

| Cola (Queue) | Job | Procesador (`Processor`) | Propósito |
|---|---|---|---|
| `mail` | `password-reset` | `MailProcessor` | Email de recuperación de contraseña (OTP) |
| `mail` | `rude-update-email` | `MailProcessor` | Email para actualizar formulario RUDE (Tutor) |
| `mail` | `push-notification` | `MailProcessor` | Alerta push FCM para campaña RUDE |
| `notifications-queue` | `grade-alert` | `NotificationsProcessor` | Alerta push FCM para tutor cuando nota final < 51 |
| `export-queue` | `generate-massive-carnets` | `IdentityProcessor` | Renderizado masivo y compresión ZIP de Carnets PVC |
| `export-queue` | `generate-massive-zip` | `TimetablesProcessor` | Renderizado masivo y compresión ZIP de Horarios |
| `reports-queue` | `generate-massive-bulletins` | `ReportsProcessor` | Renderizado masivo y compresión ZIP de Libretas Escolares |

> [!NOTE]
> **Asistencia Síncrona:** Las notificaciones de asistencia (*check-in / check-out, atrasos y ausencias*) se envían directamente a través de `FirebaseService` dentro de `AttendanceListener` sin pasar por colas asíncronas de BullMQ, lo cual representa un riesgo de bloqueo ante alto tráfico.

