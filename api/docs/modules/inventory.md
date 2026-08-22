# Inventario de Módulos — UECG Backend

## Índice de Módulos

| # | Módulo | Ruta Base | Controller | Service | DTOs | Estado |
|---|---|---|---|---|---|---|
| 1 | auth | `/auth` | ✅ | ✅ | ✅ 7 DTOs | ✅ |
| 2 | users | `/users` | ✅ | ✅ | ✅ 4 DTOs | ✅ |
| 3 | institutions | `/institutions` | ✅ | ✅ | ✅ | ✅ |
| 4 | academic-years | `/academic-years` | ✅ | ✅ | ✅ | ✅ |
| 5 | classrooms | `/classrooms` | ✅ | ✅ | ✅ | ✅ |
| 6 | subjects | `/subjects` | ✅ | ✅ | ✅ | ✅ |
| 7 | teacher-assignments | `/teacher-assignments` | ✅ | ✅ | ✅ | ✅ |
| 8 | class-periods | `/class-periods` | ✅ | ✅ | ✅ | ✅ |
| 9 | timetables | `/timetables` | ✅ | ✅ | ✅ | ✅ |
| 10 | students | `/students` | ✅ | ✅ | ✅ | ✅ |
| 11 | enrollments | `/enrollments` | ✅ | ✅ | ✅ | ✅ |
| 12 | guardians | `/guardians` | ✅ | ✅ | ✅ | ✅ |
| 13 | trimesters | `/trimesters` | ✅ | ✅ | ✅ | ✅ |
| 14 | attendance | `/attendance` | ✅ | ✅ | ✅ | ✅ |
| 15 | grades | `/grades` | ✅ | ✅ | ✅ 3 DTOs | ✅ |
| 16 | identity | `/identity` | ✅ | ✅ | — | ✅ |
| 17 | dashboard | `/dashboard` | ✅ | ✅ | — | ✅ |
| 18 | audit | `/audit` | ✅ | ✅ | — | ✅ |
| 19 | reports | `/reports` | ✅ | ✅ | — | ✅ |
| 20 | notifications | — | — | ✅ | — | ✅ |
| 21 | physical-spaces | `/physical-spaces` | ✅ | ✅ | — | 🟡 |
| 22 | data-updates | `/data-updates` | ✅ | ✅ | — | 🟡 |

---

## Módulo: `auth`

**Propósito:** Gestión completa del ciclo de vida de autenticación  
**Endpoints principales:**
- `POST /auth/login` — Inicio de sesión (rate limited 5/min)
- `POST /auth/refresh` — Rotación de refresh token
- `POST /auth/logout` — Cierre de sesión + limpieza de cookies
- `POST /auth/setup-password` — Configuración contraseña inicial
- `POST /auth/forgot-password` — Solicitar OTP de recuperación (rate limited)
- `POST /auth/reset-password` — Cambiar contraseña con OTP
- `POST /auth/register-guardian` — Auto-registro padres (App móvil)
- `POST /auth/register-student` — Auto-registro estudiantes (App móvil)
- `PATCH /auth/fcm-token` — Registrar dispositivo para Push Notifications

**Permisos requeridos:** Público (sin JWT) para login/recovery; JWT para FCM token  
**Servicios internos:** `AuthTokenService`, `AuthPasswordService`, `AuthRecoveryService`, `AuthMobileService`, `RolesService`

---

## Módulo: `users`

**Propósito:** Gestión de cuentas de usuario del sistema educativo (personal)  
**Endpoints principales:**
- `GET /users` — Listar usuarios con paginación + búsqueda + filtro por rol
- `POST /users` — Crear nuevo usuario
- `GET /users/profile` — Perfil del usuario autenticado
- `PATCH /users/profile` — Actualizar perfil propio
- `POST /users/change-password` — Cambio de contraseña
- `PATCH /users/:id` — Actualizar datos de otro usuario (Admin)
- `DELETE /users/:id` — Desactivar usuario (soft delete → INACTIVE)
- `PATCH /users/:id/reactivate` — Reactivar usuario
- `POST /users/:id/reset-password` — Resetear contraseña (genera temporal)

**Permisos:** ABAC - solo SUPER_ADMIN/DIRECTOR para admin; cualquier autenticado para perfil propio  
**Notas:** Datos PII (ci, phone, address) se encriptan con AES antes de guardar en DB

---

## Módulo: `students`

**Propósito:** Gestión del catálogo de estudiantes y flujo de inscripción RUDE  
**Endpoints principales:**
- `POST /students/register-rude` — Registro completo (estudiante + tutores + RUDE en transacción)
- `POST /students/import-excel/:academicYearId` — Importación masiva desde Excel
- `GET /students` — Directorio de estudiantes con filtros
- `GET /students/:id` — Detalle de estudiante
- `PATCH /students/:id` — Actualización de datos (datos verificación SIE)

**Patrón clave:** Transacción ACID — si falla cualquier paso (estudiante, tutor, inscripción, RUDE), todo hace rollback  
**Permisos:** `write:any:Enrollment` para crear; `read:all:Student` para ver todos

---

## Módulo: `enrollments`

**Propósito:** Gestión del estado de inscripciones (máquina de estados)  
**Estados (FSM):**
```
REVISION_SIE → INSCRITO (Director aprueba RUDE)
REVISION_SIE → RECHAZADO (Director rechaza)
INSCRITO → RETIRADO (Baja a medio año)
INSCRITO → TRASPASO (Traslado a otro colegio)
INSCRITO → OBSERVADO (Documentación pendiente)
```

**Endpoints principales:**
- `GET /enrollments` — Lista de inscripciones con filtros
- `GET /enrollments/classroom/:classroomId` — Nómina de un curso
- `PATCH /enrollments/:id/status` — Cambiar estado de inscripción
- `GET /enrollments/:id` — Detalle de inscripción

---

## Módulo: `attendance`

**Propósito:** Control de asistencia multi-método (Manual, QR, Automático)  
**Endpoints principales:**
- `GET /attendance/schedule?date=` — Horario diario del docente (bloques agrupados)
- `GET /attendance/classroom` — Lista de alumnos + estado de asistencia del día
- `POST /attendance/bulk` — Guardado masivo de asistencia (múltiples periodos)
- `POST /attendance/scan` — Registro por escaneo QR
- `POST /attendance/manual` — Marcado individual manual
- `GET /attendance/monitor` — Monitor en vivo del estado de asistencia
- `GET /attendance/history/:enrollmentId` — Historial de faltas/tardanzas
- `PATCH /attendance/justify/:recordId` — Justificar falta

**Características:** Agrupación de periodos en "bloques", timezone Bolivia (UTC-4), cache de reglas de institución

---

## Módulo: `grades`

**Propósito:** Sistema de calificaciones conforme Ley 070 boliviana (SER+SABER+HACER+AUTO)  
**Lógica de cálculo:**
```
totalScore = scoreSer + scoreSaber + scoreHacer + scoreAuto (max: 100)
if (totalScore >= 51): finalScore = totalScore, recoveryScore = null
else: finalScore = min(recoveryScore, 51)  // Recuperatorio caps a 51
```

**Endpoints principales:**
- `PUT /grades` — Guardar/actualizar nota individual (upsert)
- `PUT /grades/bulk` — Guardar notas de toda la planilla
- `GET /grades/assignment/:id/trimester/:id` — Planilla de notas
- `POST /grades/change-requests` — Solicitar corrección de nota
- `GET /grades/change-requests/pending` — Solicitudes pendientes de aprobación
- `PATCH /grades/change-requests/:id/resolve` — Aprobar o rechazar corrección

---

## Módulo: `dashboard`

**Propósito:** Estadísticas en tiempo real con cache Redis  
**Endpoints principales:**
- `GET /dashboard/root` — Stats sistema (usuarios, roles, tamaño DB) — cache 15min
- `GET /dashboard/global` — Stats académicas (alumnos, cursos, docentes) — cache 5min
- `GET /dashboard/teacher` — Stats personales del docente — cache 1min

---

## Módulo: `identity`

**Propósito:** Generación de carnets QR para control de asistencia  
**Endpoints principales:**
- `POST /identity/generate` — Generar carnet QR (job asíncrono BullMQ)
- `GET /identity/status/:jobId` — Estado de generación del carnet
- `POST /identity/validate` — Validar un token QR

**Gateway WebSocket:** Notificación en tiempo real cuando el carnet está listo

---

## Módulo: `reports`

**Propósito:** Generación de reportes PDF (libretas, nóminas, estadísticas)  
**Procesamiento:** BullMQ Job Processor asíncrono con `@react-pdf/renderer`  
**Endpoints principales:**
- `POST /reports/request` — Solicitar generación de reporte (job asíncrono)
- `GET /reports/status/:jobId` — Estado del reporte

---

## Módulo: `timetables`

**Propósito:** Gestión de horarios con reglas de integridad ("Reglas de Oro")  
**Reglas de Oro (enforced por DB unique constraints):**
1. Un curso NO puede tener dos materias a la misma hora/día
2. Un docente NO puede dictar en dos cursos distintos a la misma hora/día

**Endpoints principales:**
- `GET /timetables/classroom/:classroomId` — Horario de un curso
- `GET /timetables/teacher/:teacherId` — Horario de un docente
- `POST /timetables/slot` — Crear casilla de horario
- `DELETE /timetables/slot/:id` — Eliminar casilla

---

## Módulo: `audit`

**Propósito:** Trazabilidad de acciones del sistema  
**Implementación:** Interceptor `AuditInterceptor` que registra automáticamente mutations (POST/PATCH/DELETE)  
**Endpoints:**
- `GET /audit` — Ver log de auditoría (solo SUPER_ADMIN)

---

## Módulo: `notifications` (interno)

**Propósito:** Abstracción de canales de notificación (Push FCM, Email)  
**Sin endpoints HTTP** — Consumido internamente por otros módulos vía BullMQ jobs

---

## Módulo: `mail` (interno)

**Propósito:** Envío de emails transaccionales vía Nodemailer  
**Uso actual:** Códigos OTP para recuperación de contraseña  
**Sin endpoints HTTP** — Consumido por `AuthRecoveryService`
