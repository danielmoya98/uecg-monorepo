# Reglas de Negocio del Sistema - UECG Backend

Este documento detalla las reglas de negocio explícitas e implícitas implementadas en el backend de la Unidad Educativa Che Guevara (UECG). Estas reglas garantizan la integridad de la base de datos, la seguridad del sistema y el cumplimiento de las normativas de educación vigentes en Bolivia.

---

## 1. Reglas de Seguridad y Acceso (RBAC / ABAC)

### 1.1 Autenticación y Bloqueo de Cuentas (`auth`)
*   **Límite de Intentos Fallidos:** Si un usuario ingresa una contraseña incorrecta **5 veces** seguidas, su cuenta se bloquea automáticamente.
*   **Tiempo de Lockout:** El bloqueo de la cuenta dura **15 minutos** (`lockoutUntil`). El sistema impide cualquier intento de autenticación durante este lapso y devuelve un mensaje indicando el tiempo restante.
*   **Primer Acceso Requerido (Onboarding):** Al crearse un usuario, el campo `requiresPasswordChange` se inicializa en `true`. En su primer login exitoso, el sistema no emite tokens definitivos sino un token temporal de configuración (`setupToken`) con validez de 15 minutos, forzando la redirección al flujo de cambio de contraseña.
*   **Rotación de Refresh Tokens:** En cada petición de refresco de sesión (`POST /auth/refresh`), el refresh token utilizado queda invalidado y se genera un par nuevo de tokens (access + refresh), persistiendo encriptado el nuevo hash en la base de datos para mitigar ataques de secuestro de sesión.

### 1.2 Autorización ABAC
*   **Estructura del Permiso:** Se evalúa mediante cadenas con formato `acción:alcance:sujeto` (ej. `create:own:Attendance`).
*   **Bypass de Root:** Cualquier usuario que cuente con el permiso `manage:all:all` (típicamente asignado al rol `SUPER_ADMIN`) salta todas las validaciones de propiedad y tiene control de lectura/escritura total.
*   **Restricción de Alcance `own`:**
    *   **Docente:** Solo puede modificar y leer planillas de asistencia, horarios y calificaciones de las materias y cursos asignados contractualmente a su persona (`TeacherAssignment`).
    *   **Tutor/Padre:** Solo puede leer información de asistencia, reportes o datos generales de los estudiantes vinculados a su código de tutor (`StudentGuardian`).

---

## 2. Reglas del Ciclo de Vida Académico

### 2.1 Transición del Año Lectivo (`AcademicYear`)
La gestión académica escolar sigue una Máquina de Estados Finita (FSM) estricta:
```
 PLANNING (Planificación) ──► ACTIVE (Activo) ──► CLOSED (Cerrado)
```
*   **Regla de Gestión Activa Única:** Solo se permite la existencia de **una** gestión en estado `ACTIVE` a la vez en toda la base de datos.
*   **Restricción de Histórico:** Una vez que la gestión pasa a estado `CLOSED`, se convierte en un registro histórico inmutable. El backend restringe cualquier mutación (POST, PUT, PATCH, DELETE) sobre cursos, asignaciones de docentes, inscripciones, asistencias o calificaciones pertenecientes a ese año.

### 2.2 Cupos de Cursos y Paralelos (`Classroom`)
*   **Restricción de Capacidad:** Cada paralelo tiene un límite máximo de alumnos (por defecto 35, parametrizable por curso). Al realizar una inscripción, el sistema verifica transaccionalmente la cantidad de registros en `Enrollment` con estados activos para evitar la sobreventa de cupos. Si se alcanza el límite, se dispara un `ConflictException`.
*   **Unicidad del Paralelo:** No es posible crear paralelos duplicados. La base de datos restringe la existencia de más de una combinación única de `[academicYearId, level, grade, section, shift]`.

### 2.3 Carga Horaria y Horarios
*   **Asignación de Docente Titular:** En una gestión lectiva, una materia en un curso específico solo puede ser dictada por un único profesor titular. Esto se resguarda mediante la restricción única en `TeacherAssignment` sobre `[classroomId, subjectId]`.
*   **Reglas de Oro del Horario (`ScheduleSlot`):**
    1.  **Regla de Curso:** Un paralelo no puede tener dos materias asignadas a la misma hora y día de la semana. Constraint: `@@unique([classroomId, dayOfWeek, classPeriodId])`.
    2.  **Regla de Docente:** Un docente no puede estar asignado a dictar clase en dos cursos distintos a la misma hora y día de la semana. Constraint: `@@unique([teacherId, dayOfWeek, classPeriodId])`.
*   **Regla de Descanso:** No es posible asignar materias en periodos marcados como recreo o descanso (`ClassPeriod.isBreak = true`). La interfaz de edición de horarios valida esta propiedad a través de las API del backend.

---

## 3. Reglas de Inscripción y RUDE

### 3.1 Transacción e Integridad RUDE
*   **Inscripción Atómica (ACID):** El registro RUDE completo se realiza dentro de una sola transacción de base de datos (`$transaction`). Si ocurre una falla al insertar la ficha socioeconómica, las relaciones de parentesco de los tutores o la inscripción física en el paralelo, la base de datos realiza un rollback total.
*   **Unicidad Anual de Matrícula:** Un estudiante no puede estar inscrito en más de un curso en la misma gestión escolar. Se restringe vía la combinación única `@@unique([studentId, academicYearId])` en el modelo `Enrollment`.
*   **Prevención de Duplicados PII:** La base de datos exige que el Carnet de Identidad del estudiante y de los tutores sea único en el sistema. Se valida encriptando el carnet y comparando el hash blind index (`ciHash`).

### 3.2 Máquina de Estados de la Inscripción (`Enrollment`)
El estado de la matrícula de un estudiante sigue el flujo definido por las normativas del Ministerio:
*   **REVISION_SIE:** Estado inicial por defecto al crear un RUDE. El estudiante está pre-inscrito a la espera de que la dirección escolar o la secretaría verifique la validez de los documentos físicos aportados.
*   **INSCRITO:** La pre-inscripción es aprobada. El estudiante queda oficialmente registrado en la nómina activa y se le permite registrar asistencia y calificaciones.
*   **RECHAZADO:** La pre-inscripción es declinada debido a inconsistencias documentales. El cupo reservado en el paralelo se libera.
*   **OBSERVADO:** El estudiante asiste a clases pero tiene documentos pendientes de regularizar. Permite registrar asistencia pero restringe la emisión de libretas escolares.
*   **RETIRADO:** Baja voluntaria solicitada por el tutor a medio año. El estudiante deja de figurar en la nómina activa del docente.
*   **TRASLADO:** El estudiante se traslada oficialmente a otra unidad educativa boliviana.

---

## 4. Reglas de Control de Asistencia (`attendance`)

### 4.1 Timezones y Tolerancia
*   **Zona Horaria Oficial:** Toda la lógica de asistencia calcula las horas utilizando la zona horaria de Bolivia (UTC-4, manejada a nivel de código mediante funciones de sanitización como `getSafeLocalDate()`).
*   **Tolerancia de Atraso:** Parametrizada por la institución en `lateToleranceMinutes` (por defecto 5 minutos). Si la clase inicia a las 08:00 y el escaneo QR o marcado manual ocurre a las 08:06, el estado se registra automáticamente como `LATE` (Atraso).
*   **Límite de Falta:** Parametrizada en `absentToleranceMinutes` (por defecto 15 minutos). Si el estudiante llega después de las 08:15, el sistema cataloga el registro como `ABSENT` (Falta) de forma automática.
*   **Justificaciones:** Una falta o retraso solo puede ser justificado administrativamente por la secretaría o dirección. Al guardar la justificación, el estado del registro de asistencia cambia a `EXCUSED` y requiere ingresar una cadena de texto que fundamente la licencia.

### 4.2 Seguridad de Control QR
*   **Tokenización de Carnet:** El código QR de la credencial estudiantil almacena un JWT cifrado firmado por el backend.
*   **Invalidez por Re-emisión:** Si el carnet es re-emitido (ej. pérdida), se incrementa el campo `qrTokenVersion` en el modelo `Student`. El validador del backend rechaza cualquier intento de marcado con códigos QR generados con una versión inferior a la activa, previniendo duplicaciones de carnets antiguos.

---

## 5. Reglas del Sistema de Calificaciones (Ley 070)

### 5.1 Restricción de Puntaje y Rango
El sistema valida que las calificaciones ingresadas por los docentes se encuentren estrictamente dentro de los límites legales establecidos para cada dimensión:
*   `scoreSer` (Dimensión SER): Rango $[0, 10]$ puntos.
*   `scoreSaber` (Dimensión SABER): Rango $[0, 45]$ puntos.
*   `scoreHacer` (Dimensión HACER): Rango $[0, 40]$ puntos.
*   `scoreAuto` (Dimensión Autoevaluación): Rango $[0, 5]$ puntos.
*   *Cálculo del Total:* `totalScore` = `scoreSer` + `scoreSaber` + `scoreHacer` + `scoreAuto` (Rango resultante $[0, 100]$ puntos).

### 5.2 Lógica del Reforzamiento (Recuperatorio)
*   **Derecho a Recuperación:** Habilitado únicamente si el `totalScore` consolidado del trimestre es estrictamente menor a **51** puntos.
*   **Capping de Aprobación:** Si el estudiante toma el examen recuperatorio, la calificación obtenida se registra en `recoveryScore`. La nota final oficial legal del trimestre (`finalScore`) se calcula con la fórmula:
    $$\text{finalScore} = \min(\text{recoveryScore}, 51)$$
    Si aprueba el examen de recuperación, la nota final legal se congela en 51. Si obtiene una nota menor (ej. 45), el sistema mantiene la mejor nota o el resultado del examen según corresponda. Si `totalScore >= 51`, la nota final es el propio total y el recuperatorio permanece nulo.

### 5.3 Congelamiento y Descongelamiento de Calificaciones (FSM de Notas)
*   **Estados de Calificación:**
    *   `DRAFT` (Borrador): El docente puede modificar las notas libremente desde su planilla de curso.
    *   `PUBLISHED` (Publicado): Notas visibles en tiempo real para padres de familia y dirección. Siguen siendo editables por el docente hasta el cierre del ciclo.
    *   `LOCKED` (Bloqueado): Aplicado automáticamente al finalizar el trimestre o cuando la administración cierra el periodo en `Trimester`. Las notas se vuelven inmutables.
*   **Proceso de Cambio de Nota Bloqueada (`GradeChangeRequest`):**
    *   El docente debe crear una solicitud en el sistema especificando las correcciones propuestas y la justificación detallada. La solicitud entra en estado `PENDING`.
    *   Mientras exista una solicitud de cambio pendiente para una calificación específica, el sistema bloquea la creación de otras solicitudes duplicadas para el mismo estudiante y materia.
    *   Al ser aprobada por el Director, el backend ejecuta una transacción que actualiza la calificación, recalcula los totales de aprobación y cambia el estado de la solicitud a `APPROVED`.
