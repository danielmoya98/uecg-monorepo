# Propuestas de Futuras Funcionalidades Basadas en Datos — UECG Backend

**Rol:** Principal Software Architect & Principal Database Architect  
**Fecha:** 2026-06-19  

El actual diseño del esquema de base de datos de UECG cuenta con tablas estructuradas para soportar flujos complejos. A continuación, se detallan las funcionalidades de alto valor de negocio que pueden implementarse aprovechando la arquitectura de datos existente.

---

## 📊 1. Motor de Dashboards y Analítica Predictiva

La combinación de las tablas `grades`, `attendance_records` e `enrollments` abre la puerta a analíticas avanzadas sin necesidad de reestructurar la base de datos.

### A. Sistema de Alerta Temprana de Abandono Escolar (Early Warning System - EWS)
* **Objetivo:** Identificar estudiantes en riesgo de deserción o reprobación antes del cierre de gestión.
* **Uso de Datos Actuales:**
  * **Asistencia:** Filtrar estudiantes con más del 20% de inasistencias (`AttendanceStatus.ABSENT`) acumuladas en la tabla `attendance_records` con respecto al total de periodos pasados.
  * **Calificaciones:** Estudiantes con notas menores a 51 (`totalScore < 51`) en más de 2 materias en la tabla `grades`.
  * **Acción:** Calcular un score de riesgo dinámico (Bajo, Medio, Alto) y mostrarlo en el dashboard del Director y del Asesor de Curso (`Classroom.advisorId`).

### B. Dashboard de Cobertura y Rendimiento Docente (para la Dirección)
* **Objetivo:** Evaluar la eficiencia y puntualidad del personal docente en la carga del registro pedagógico.
* **Uso de Datos Actuales:**
  * Cruzar `Trimester.endDate` con `Grade.lastModifiedAt` y `Grade.status`.
  * Identificar qué docentes mantienen notas en estado `DRAFT` pasado el límite de cierre del trimestre.
  * Calcular el promedio general de notas por materia (`Subject`) y curso (`Classroom`) para detectar desviaciones estadísticas (ej. materias con tasas de aprobación sospechosamente bajas o altas).

---

## 🔒 2. Trazabilidad de Calificaciones y Auditoría Pedagógica

Debido a que el control de notas es altamente sensible a adulteraciones, es imperativo elevar los controles de seguridad utilizando las relaciones de auditoría de calificaciones.

### A. Registro Histórico de Cambios de Calificaciones (Grade Audit Trail)
* **Objetivo:** Mantener un histórico inmutable de cada cambio de nota (SER/SABER/HACER/AUTO/FINAL).
* **Propuesta de Datos:** Crear una tabla `GradeHistory` (o `grade_histories`) vinculada a `Grade`:
  ```prisma
  model GradeHistory {
    id        String   @id @default(uuid())
    gradeId   String   @map("grade_id")
    changedById String @map("changed_by_id") // Relación a User
    
    // Estado anterior y nuevo
    oldScoreSer   Int?
    newScoreSer   Int?
    oldScoreSaber Int?
    newScoreSaber Int?
    // ... otros campos
    
    changedAt DateTime @default(now()) @map("changed_at")
    reason    String?  // Razón del cambio (opcional si es directo en periodo abierto)
  }
  ```
* **Lógica:** Implementar un middleware de Prisma o un trigger en PostgreSQL que guarde el estado anterior automáticamente en cada mutación de la tabla `grades`.

### B. Flujo de Descongelamiento de Notas en 2 Pasos (2-Step Change Approval)
* **Objetivo:** Reforzar el flujo de `GradeChangeRequest` cuando un trimestre ya está bloqueado (`GradeStatus.LOCKED`).
* **Flujo Basado en Datos Actuales:**
  1. El docente crea una solicitud en `GradeChangeRequest` con los valores propuestos y el justificativo (`reason`).
  2. El sistema emite una notificación al Director.
  3. Al aprobarse (`status` pasa de `PENDING` a `APPROVED`), una transacción atómica actualiza la tabla `grades` con los valores propuestos y cambia el estado del `Grade` temporalmente a `PUBLISHED` para que se recalculen las notas finales antes de volver a congelarse.

---

## 🔔 3. Motor de Notificaciones Automatizadas (Push + Canales)

La tabla `institutions` ya cuenta con campos de tolerancia y canales activos (`activeNotificationChannels`, `notificationFrequency`). El motor de notificaciones puede explotar esto de forma inmediata.

### A. Alertas en Tiempo Real de Ingreso/Salida y Atrasos
* **Objetivo:** Notificar a los padres de familia (`Guardian`) la hora exacta en que su hijo ingresó o no al establecimiento.
* **Uso de Datos Actuales:**
  * Al escanear el QR (`attendance/scan`), el sistema inserta un registro en `attendance_records` con `status = PRESENT` o `LATE`.
  * Si la hora del scan supera la tolerancia (`lateToleranceMinutes`), el listener de eventos de dominio captura la inserción y encola un job en BullMQ (`notifications-queue`) con tipo `late-alert` o `absent-alert`.
  * Utilizando el `guardianId` de la inscripción, el sistema busca los `fcmTokens` del `User` asociado y envía la alerta al teléfono del padre.

### B. Notificación Automática de Calificaciones Deficientes
* **Objetivo:** Involucrar a los padres tempranamente si el estudiante tiene bajas notas en evaluaciones parciales.
* **Uso de Datos Actuales:**
  * Al guardar una nota (`grades/bulk` o `grades` upsert), si el promedio ponderado calculado da un total menor a 51, se emite un evento de dominio `grade.alert.failed`.
  * El processor de notificaciones asíncrono envía un correo y una alerta push al tutor con el resumen del rendimiento académico del estudiante en esa asignatura específica.

---

## 🤖 4. Automatizaciones de Negocio y Workflows

### A. Campañas Digitales de Actualización RUDE
* **Objetivo:** Minimizar la carga administrativa de secretaría permitiendo a los tutores actualizar sus datos desde su App Móvil.
* **Uso de Datos Actuales:**
  * Si `Institution.enableDigitalRudeUpdates = true`, el sistema habilita un banner en la app del padre de familia.
  * El padre introduce los datos y estos se guardan en la tabla de cuarentena `DataUpdateRequest` (con los datos propuestos serializados en `proposedData` JSON).
  * La secretaría visualiza y aprueba o rechaza los cambios. Si los aprueba, el sistema actualiza el registro maestro en `RudeRecord` de forma automática, incrementando `rudeUpdateCount` en `Enrollment` para bloquear la acción si excede `maxRudeUpdatesPerYear`.

### B. Cierre Automático de Trimestres y Congelamiento de Notas
* **Objetivo:** Evitar la edición de notas fuera de fecha sin previa autorización.
* **Uso de Datos Actuales:**
  * Un cron job diario en NestJS (`@nestjs/schedule`) verifica si la fecha actual es mayor a la de `Trimester.endDate` para los trimestres activos (`isOpen = true`).
  * Si expira, el sistema ejecuta una transacción para:
    1. Cambiar `Trimester.isOpen = false`.
    2. Actualizar en masa todos los registros de la tabla `grades` asociados a ese trimestre a `status = LOCKED`.
    3. Emitir un reporte consolidado en PDF de la planilla del colegio para fines de archivo SIE.

### C. Validador Inteligente de Conflictos de Horario y Aulas
* **Objetivo:** Impedir la asignación manual errónea de horarios al incorporar `physical-spaces`.
* **Uso de Datos Actuales:**
  * Cuando se crea una casilla de horario (`ScheduleSlot`), el servicio de negocio valida contra las restricciones únicas:
    * El docente no debe tener otra clase a esa hora/día (`teacherId + dayOfWeek + classPeriodId`).
    * El curso no debe tener otra materia asignada (`classroomId + dayOfWeek + classPeriodId`).
  * **Nueva Regla:** Si el colegio usa `SchedulingMode = DYNAMIC`, validar que el salón físico (`physicalSpaceId`) no esté ocupado por otra clase a esa misma hora, previniendo choques de espacio.
