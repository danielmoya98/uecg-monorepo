# Flujos de Trabajo y Procesos del Negocio - UECG Backend

Este documento detalla los flujos de trabajo secuenciales ejecutados por el backend de la Unidad Educativa Che Guevara (UECG). Describe el paso a paso de los procesos administrativos y académicos, especificando cómo interactúan los controladores, servicios, base de datos y colas asíncronas.

---

## 1. Onboarding del Personal y Recuperación de Contraseña

### 1.1 Configuración de Cuenta de Primer Acceso (Setup Password)
Cuando la secretaría o el administrador registra a un nuevo miembro del personal docente o administrativo, la cuenta se crea en estado inactivo para uso operacional hasta que el usuario activa su cuenta.

```
[Admin] crea Usuario ──► User.requiresPasswordChange = true
                             │
                             ▼
                     [User] hace Login
                             │
            ┌────────────────┴────────────────┐
            ▼ (Login temporal)                ▼ (Bypass si false)
     SetupToken (15 min)             Tokens de Acceso Normales
            │
            ▼
   POST /auth/setup-password
 (newPassword + setupToken)
            │
            ▼
    Hash con bcrypt
 requiresPasswordChange = false
   status = ACTIVE
   Establece Cookies HttpOnly
```

1.  **Registro:** El administrador crea el usuario (`POST /users`). El backend guarda la cuenta con una contraseña provisoria hasheada, `status = ACTIVE` y `requiresPasswordChange = true`.
2.  **Primer Login (`POST /auth/login`):** El backend autentica la contraseña provisoria, pero al detectar `requiresPasswordChange = true`, frena la emisión de accesos normales y retorna `{ status: 'SETUP_REQUIRED', setupToken }`.
3.  **Configuración de Contraseña (`POST /auth/setup-password`):** El usuario ingresa su nueva contraseña definitiva. El cliente HTTP envía la petición incluyendo el `setupToken`.
4.  **Consolidación:** El servicio de autenticación valida la firma del token de setup, hashea la nueva contraseña con 10 salt rounds de bcrypt, actualiza la base de datos marcando `requiresPasswordChange = false` y establece las cookies httpOnly definitivas (`uecg_access_token` y `uecg_refresh_token`).

---

## 2. Inscripción RUDE Completa (Transaccional)

Este flujo se ejecuta cuando se inscribe a un alumno nuevo o regular cargando la ficha RUDE de forma completa. Requiere atomicidad total para evitar registros huerfanos.

```
                     POST /students/register-rude
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │   Inicia $transaction   │
                     └────────────┬────────────┘
                                  │
      1. Valida Cupos             ▼
      Classroom.enrollments < capacity ? (Si no: Abort/Rollback)
                                  │
      2. Mapea Estudiante         ▼
      Busca ciHash en DB. ¿Existe? -> Reusar / ¿No? -> Crear Student
                                  │
      3. Valida Inscripción Anual ▼
      ¿Tiene inscripción activa en la Gestión? (Si sí: Abort/Conflict)
                                  │
      4. Mapea Tutores (Array)    ▼
      Por cada tutor: busca ciHash -> Reusar/Crear Guardian -> Enlazar StudentGuardian
                                  │
      5. Genera Inscripción       ▼
      Crear Enrollment (status: REVISION_SIE)
                                  │
      6. Guarda Ficha Socioecon.  ▼
      Crear RudeRecord enlazado a la Inscripción
                                  │
                     ┌────────────▼────────────┐
                     │  Commit de Transacción  │
                     └─────────────────────────┘
```

---

## 3. Creación de Casilla de Horario e Integridad

Los horarios se configuran de manera interactiva por la dirección en la etapa de planificación.

1.  **Petición (`POST /timetables/slot`):** El cliente envía los parámetros `dayOfWeek`, `classPeriodId` (periodo horario) y `teacherAssignmentId` (carga horaria).
2.  **Verificación de Periodo:** El servicio de horarios consulta `ClassPeriod` por ID. Si `isBreak = true`, aborta con error indicando que es un periodo de recreo.
3.  **Control de Choque de Curso (Regla de Oro 1):** El servicio valida que no exista una celda en `ScheduleSlot` que coincida en `classroomId`, `dayOfWeek` y `classPeriodId`.
4.  **Control de Choque de Docente (Regla de Oro 2):** El servicio consulta la carga horaria para obtener el ID del profesor. Valida que no exista ninguna celda en `ScheduleSlot` que coincida en `teacherId`, `dayOfWeek` y `classPeriodId` en ningún otro curso de la institución.
5.  **Asignación de Salón (Espacio Físico):** Si la institución funciona bajo asignación dinámica o requiere reservar un laboratorio (`PhysicalSpace`), el backend verifica que el salón físico no esté reservado por otro curso en el mismo día y periodo.
6.  **Persistencia:** Si se aprueban todas las reglas, se inserta el `ScheduleSlot`.

---

## 4. Control de Asistencia Diaria (Manual y QR)

### 4.1 Marcado por Escaneo de Carnet QR
Es el flujo optimizado para la App móvil del estudiante y la terminal de escaneo del colegio.

```
       [Estudiante] presenta QR ──► [Lector/App] escanea y extrae token
                                          │
                                          ▼
                                  POST /attendance/scan
                                          │
                                          ▼
                             ┌─────────────────────────┐
                             │  Validaciones de Firma  │
                             └────────────┬────────────┘
                                          │
                                          ▼
                       ¿qrTokenVersion coincide con Student?
                               (No: Abort/Unauthorized)
                                          │
                                          ▼
                        ¿Hora actual dentro de la Tolerancia?
              ┌───────────────────────────┴───────────────────────────┐
              ▼ (Llegó a tiempo)                                      ▼ (Pasó tolerancia)
       Status: PRESENT                                         ¿Pasó límite de falta?
                                                     ┌────────────────┴────────────────┐
                                                     ▼ (Llegó tarde)                   ▼ (No llegó)
                                              Status: LATE                      Status: ABSENT
                                                     │                                 │
                                                     └────────────────┬────────────────┘
                                                                      │
                                                                      ▼
                                                            Guardar AttendanceRecord
                                                                      │
                                                                      ▼
                                                            Emitir Evento de Dominio
                                                           "attendance.qr.scanned"
                                                                      │
                                                                      ▼
                                                          BullMQ: Push Notificación
                                                             a la App del Tutor
```

---

## 5. Planilla de Notas y Aprobación de Cambios (Ley 070)

Este proceso detalla cómo interactúa la edición docente con las restricciones del director en el cierre de periodos.

### 5.1 Registro Normal (Trimester Abierto)
1.  **Edición:** El docente carga los puntajes de las dimensiones en su planilla web. El sistema envía las calificaciones mediante `PUT /grades/bulk`.
2.  **Cálculo e Inserción:** Para cada alumno, el servicio de notas calcula la nota acumulada de las dimensiones, realiza la verificación de aprobación ($>=51$), setea el estado en `DRAFT` o `PUBLISHED` (según acción del docente) e inserta/actualiza el registro en la tabla `Grade`.

### 5.2 Cierre de Trimestre e Inmutabilidad
1.  **Cierre:** La administración realiza el cierre formal del trimestre (`PATCH /trimesters/:id`).
2.  **Congelamiento:** El backend actualiza todas las notas pertenecientes al trimestre bloqueado (`Grade.status = LOCKED`). A partir de este momento, cualquier petición directa de edición (`PUT /grades`) es rebotada con un error `ForbiddenException`.

### 5.3 Flujo de Solicitud de Cambio de Calificación (Grade Change Request)
Para modificar una calificación bloqueada, se debe seguir el protocolo de auditoría:

```
[Docente] solicita cambio ──► Genera GradeChangeRequest (status: PENDING)
                                     │
                                     ▼
                          [Director] revisa en Panel
                                     │
                  ┌──────────────────┴──────────────────┐
                  ▼ (Aprobar)                           ▼ (Rechazar)
      POST /change-requests/:id/resolve             POST /change-requests/:id/resolve
           (status: APPROVED)                            (status: REJECTED)
                  │                                             │
                  ▼ (Transacción ACID)                          ▼
     Actualiza Grade.dimensions                          request.status = REJECTED
     Recalcula Totales y Aprobación                      Registra motivo de rechazo
     request.status = APPROVED
     Registra Auditoría del Director
```

---

## 6. Generación de Carnets y Reportes Asíncronos (BullMQ)

Para evitar bloquear el hilo principal de Node.js con tareas pesadas de renderizado de archivos PDF, el backend delega estas tareas a colas de mensajería Redis gobernadas por BullMQ.

1.  **Solicitud:** El cliente realiza una petición para generar la libreta escolar o carnet QR (`POST /reports/request`).
2.  **Encolamiento:** El controlador recibe la petición, valida los parámetros y añade un Job a la cola correspondiente en Redis (`reports-queue` o `identity-queue`). El backend responde de inmediato al cliente con un código de estado `202 Accepted` y el `jobId` del proceso.
3.  **Procesamiento:** El servicio `ReportsProcessor` o `IdentityProcessor` toma el Job en segundo plano. Utiliza la librería `@react-pdf/renderer` para renderizar el PDF, lo compila y lo guarda en el almacén de archivos (o genera la firma del token QR).
4.  **Notificación Real-time:** Una vez finalizado el renderizado, el procesador emite un evento del sistema. El Gateway de WebSockets (`IdentityGateway`) captura el evento y envía una notificación en tiempo real al cliente conectado indicando que el archivo está listo para descarga.
