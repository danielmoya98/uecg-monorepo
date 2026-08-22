# Auditoría y Revisión de Arquitectura de Datos — UECG Backend

**Rol:** Principal Database Architect & Software Architect  
**Fecha:** 2026-06-19  
**Estado de la Base de Datos:** 🟡 **EN PRODUCCIÓN / DESARROLLO ACTIVO**  
**Stack de Datos:** PostgreSQL + Prisma ORM v7  

---

## 📊 Score de Arquitectura de Datos: **75/100** (C+)

La base de datos presenta una estructura conceptual sólida con una correcta separación de responsabilidades y un motor de asignación de horarios robusto (con exclusiones mutuas bien diseñadas). Sin embargo, existen **deficiencias críticas** en cuanto a consistencia de nomenclatura física, indexación para escalabilidad, riesgos de pérdida de datos por cascadas mal configuradas y un bug lógico severo en el control de cuarentena del formulario RUDE.

---

## 🚨 Riesgos Técnicos Críticos y Correcciones

### 1. El Bug de Unicidad en `DataUpdateRequest` (Alta Severidad)
* **Ubicación:** `DataUpdateRequest` (`@@unique([enrollmentId, status])`)
* **Problema:** Esta restricción impide que una inscripción tenga más de un registro de actualización en el mismo estado a lo largo de toda su historia.
  * Si un padre solicita una actualización de datos en el Trimester 1 y es **APROBADA** (status `APPROVED`), el registro queda en la base de datos como `(enrollment_id, 'APPROVED')`.
  * Si en el Trimester 2 el padre necesita volver a actualizar su teléfono y el Director la aprueba, el sistema intentará guardar una nueva tupla `(enrollment_id, 'APPROVED')`. Esto lanzará un error de violación de clave única en PostgreSQL, **bloqueando cualquier actualización futura para ese estudiante**.
* **Remediación:** Remover la restricción de base de datos `@@unique([enrollmentId, status])`. Si se desea garantizar que solo exista **una solicitud PENDING activa a la vez**, se debe:
  1. Controlar esto en la capa de servicio de NestJS (validando la inexistencia de solicitudes PENDING antes de crear una).
  2. O bien crear un índice parcial único directamente en PostgreSQL mediante una migración SQL (ya que Prisma no soporta índices parciales nativos en su DSL):
     ```sql
     CREATE UNIQUE INDEX "data_update_requests_active_idx" 
     ON "data_update_requests" ("enrollment_id") 
     WHERE "status" = 'PENDING';
     ```

### 2. Riesgo de Pérdida de Datos en Cascada (`TeacherAssignment` / `Enrollment`)
* **Ubicación:** `ScheduleSlot.teacherAssignment`, `Grade.teacherAssignment`, `Grade.enrollment`
* **Problema:** Las relaciones están configuradas con `onDelete: Cascade`.
  * Si por error o reestructuración de la carga horaria un Director elimina un `TeacherAssignment` (ej. se reasigna la materia Matemáticas de 5to Sec. a otro profesor), **todas las calificaciones históricas de los estudiantes en esa materia se eliminarán inmediatamente** debido al borrado en cascada en la tabla `grades`.
  * Si se da de baja una inscripción (`Enrollment`), se eliminarán todas sus notas históricas y récords de asistencia asociados de forma física.
* **Remediación:** Cambiar `onDelete: Cascade` a `onDelete: Restrict` (o `NoAction`) en las relaciones críticas de calificaciones (`Grade`) y horarios. Si se requiere cambiar un docente, la API debe actualizar el `teacherId` en el `TeacherAssignment` existente en lugar de eliminar el registro y recrearlo.

### 3. Inconsistencia de Mapeo Físico en PostgreSQL (Deuda Técnica)
* **Ubicación:** Todo el "MÓDULO 3: ESTUDIANTES E INSCRIPCIONES (RUDE)" (`Student`, `Enrollment`, `Guardian`, `StudentGuardian`, `RudeRecord`).
* **Problema:** A diferencia del resto de los módulos de la base de datos (que usan mapeos explícitos snake_case plural como `@@map("users")` y `@map("created_at")`), el módulo RUDE carece por completo de mapeos a nivel de tablas y columnas.
  * **Efecto en Tablas:** PostgreSQL creará tablas con mayúsculas y nombres singulares (`Student`, `Enrollment`, `Guardian`, `StudentGuardian`, `RudeRecord`).
  * **Efecto en Columnas:** Creará columnas en camelCase (ej. `lastNamePaterno`, `birthCountry`, `createdAt`).
  * **Gravedad:** PostgreSQL es insensible a mayúsculas/minúsculas por defecto. Si un desarrollador escribe una query de reporting en SQL directo, tendrá que usar comillas dobles obligatoriamente: `SELECT "lastNamePaterno" FROM "Student"`. Si olvida las comillas, la query fallará. Además, rompe la homogeneidad del esquema de base de datos.
* **Remediación:** Agregar las directivas `@@map("students")`, `@@map("enrollments")`, `@@map("guardians")`, `@@map("student_guardians")`, `@@map("rude_records")` y sus respectivos decoradores `@map` a cada propiedad camelCase.

### 4. Duplicación Conceptual de PII (Personally Identifiable Information)
* **Problema:** El sistema duplica el Carnet de Identidad (`ci` y `ciHash`) de estudiantes y padres de familia.
  * Está en `User.ci` y `User.ciHash`.
  * También está en `Student.ci` y `Student.ciHash`.
  * Y en `Guardian.ci` y `Guardian.ciHash`.
* **Riesgo:** Si un usuario actualiza su CI desde su perfil móvil (que escribe en la tabla `users`), su registro físico de estudiante/tutor en `Student` o `Guardian` no se sincronizará automáticamente, generando inconsistencias. Además, aumenta el área de superficie para posibles fugas de datos de menores.
* **Remediación:** En una arquitectura limpia, la información de perfil personal e identificadores únicos (como el CI) deben centralizarse en una única entidad por tipo de rol, o bien el modelo `User` solo debe almacenar credenciales y token FCM, delegando la PII a los perfiles físicos correspondientes.

---

## 📈 Análisis de Escalabilidad (10x a 100x)

### 1. Índices Faltantes en Foreign Keys (El Cuello de Botella Silencioso)
PostgreSQL no crea índices automáticos sobre las claves foráneas (Foreign Keys). Sin embargo, el backend realiza constantes `JOIN`s y filtros por estas claves. Con un crecimiento de 10x o 100x de usuarios, esto generará **Sequential Scans** masivos en disco.

**Claves Foráneas Críticas que URGENTEMENTE requieren un índice:**
* `Enrollment(classroom_id)`: Cada vez que el profesor toma asistencia o lista sus alumnos, se ejecuta: `SELECT * FROM enrollments WHERE classroom_id = $1`. Sin índice, PostgreSQL leerá toda la tabla de inscripciones.
* `AuditLog(user_id)`: Para buscar las acciones realizadas por un administrador o docente.
* `GradeChangeRequest(grade_id)` y `GradeChangeRequest(requested_by_id)`: Para mostrar la bandeja de solicitudes pendientes del director o el historial del docente.
* `StudentGuardian(guardian_id)`: Para encontrar los hijos asociados a un tutor.
* `User(institution_id)`: Para filtrar personal por colegio en escenarios multi-tenant.

* **Remediación:** Añadir `@@index([classroomId])` en `Enrollment`, `@@index([userId])` en `AuditLog`, etc., dentro del esquema Prisma.

### 2. Crecimiento Exponencial de Tablas Transaccionales
* **`attendance_records`:** Un colegio de 1,000 alumnos con 6 periodos diarios generará 6,000 registros de asistencia al día. En 200 días lectivos, acumula **1.2 millones de registros al año**.
  * **A escala 100x:** 120 millones de registros anuales.
  * **Riesgo:** Las queries de agregación (porcentajes de asistencia para libretas) tardarán minutos.
  * **Estrategia:** Implementar **Particionamiento de Tablas** en PostgreSQL sobre el campo `date` (particiones mensuales o trimestrales) y crear vistas materializadas actualizadas asíncronamente vía BullMQ para los reportes acumulados.
* **`audit_logs`:** Crece con cada mutación de la API (POST/PATCH/DELETE).
  * **Riesgo:** Llenado rápido de disco.
  * **Estrategia:** Política de retención de datos. Archivar logs mayores a 1 año en almacenamiento frío (S3) y vaciar la tabla física mediante cron jobs de base de datos (`pg_cron`).

---

## 🌐 Diseño y Multi-Tenancy Futura

Actualmente, el sistema tiene una entidad `Institution` pero la arquitectura de datos **no está aislada para multi-tenant**.

### Gaps del Esquema Actual:
* `Classroom` no pertenece directamente a `Institution`. Pertenece a un `AcademicYear` global. Si dos colegios diferentes crean el curso "1ro Primaria - Paralelo A", el sistema no sabrá de cuál es, a menos que asuman que comparten la misma lista de aulas (lo cual es inviable).
* `ClassPeriod` y `PhysicalSpace` son compartidos. Los periodos de clase de un colegio privado (ej. periodos de 45 minutos con recreos específicos) colisionarán con los de un colegio fiscal.
* `AcademicYear` no tiene link a la institución (las fechas de inicio y fin de gestión pueden diferir por distrito/colegio).

### Propuesta de Cambios para Multi-Tenancy Aislado (Shared Database, Discriminator Columns):
1. **Añadir `institutionId` a Entidades Clave:**
   * `Classroom` -> `institutionId` (Establece el dueño del aula)
   * `PhysicalSpace` -> `institutionId` (Establece el dueño del salón)
   * `ClassPeriod` -> `institutionId` (Horarios configurables por colegio)
   * `AcademicYear` -> O bien hacerlo multi-tenant agregando `institutionId`, o mantenerlo global para toda la red y que las instituciones se suscriban a él.
2. **Actualizar Restricciones de Unicidad:**
   * La clave única en `Classroom` debe mutar a:
     `@@unique([institutionId, academicYearId, level, grade, section, shift])`
   * Los horarios (`ScheduleSlot`) heredarán el aislamiento a través del curso.

---

## 👥 Análisis de Relaciones y Coherencia Conceptual

### 1. ¿Entidades que podrían consolidarse?
* **`User`, `Student` y `Guardian`**:
  * Un estudiante de secundaria o un tutor que instala la aplicación móvil requiere un registro en `User` para hacer login. Pero también tiene su registro físico de datos SIE en `Student` o `Guardian`.
  * Esto resulta en dos identificadores separados para la misma persona en el sistema.
  * **Solución de Arquitectura:** Mantener la separación está bien para no ensuciar la tabla de autenticación (`User`) con cientos de campos de formulario RUDE. Sin embargo, para evitar problemas de sincronización, el CI y datos de contacto de estudiantes y tutores deben residir **exclusivamente** en `Student` / `Guardian`, y el modelo `User` solo debe actuar como un "Credential Store" con una relación 1-1 estricta hacia el perfil real.

### 2. ¿Entidades que podrían separarse?
* **`RudeRecord` y `Enrollment`**:
  * Actualmente, `RudeRecord` está acoplado 1-1 con `Enrollment` (inscripción anual).
  * En Bolivia, el formulario RUDE de un estudiante cambia muy poco de año a año (usualmente solo se actualizan servicios básicos o si empezó a trabajar).
  * Tener un `RudeRecord` entero nuevo de 40 campos clonado cada año para cada inscripción satura la base de datos con información idéntica redundante.
  * **Propuesta Evolutiva:** Mover el `RudeRecord` a una relación 1-1 directa con el `Student` (representando sus datos socioeconómicos maestros actuales) y que la tabla `Enrollment` solo guarde una captura histórica de cambios (`Snapshot`) o una referencia a los datos vigentes aprobados en ese periodo.

---

## 🛠️ Roadmap de Evolución de Datos y Roadmap Correctivo

### Fase 1: Saneamiento Inmediato (Sin Breaking Changes en la API)
1. **Corregir el bug de DataUpdateRequest:** Eliminar la restricción de base de datos única y manejar el control PENDING en NestJS.
2. **Crear Índices Críticos:** Añadir índices sobre FKs en `Enrollment`, `AuditLog`, `Grade` y `StudentGuardian` para optimizar los filtros GET cotidianos.
3. **Revisar Cascada en Calificaciones:** Cambiar la política de cascada en `Grade` y `ScheduleSlot` de `Cascade` a `Restrict` para evitar borrados accidentales de notas históricas.

### Fase 2: Consistencia de Nomenclatura (Requiere Migración de Datos Completa)
1. Escribir una migración en Prisma para renombrar físicamente las tablas y columnas del módulo RUDE en PostgreSQL a snake_case (`students`, `enrollments`, `rude_records`, etc.), aplicando las directivas `@@map` y `@map`.
2. Unificar los nombres de timestamps a `created_at` y `updated_at` en todas las tablas del sistema.

### Fase 3: Aislamiento Multi-Tenant
1. Migrar la base de datos agregando `institution_id` a `classrooms`, `physical_spaces` y `class_periods`.
2. Actualizar las constraints de unicidad y los servicios NestJS para incluir siempre el discriminator query: `where: { institutionId }`.
