# Glosario del Dominio - UECG Backend

Este documento define la terminología clave del negocio y del sistema de la **Unidad Educativa Che Guevara (UECG)**. Los términos aquí listados mapean directamente la jerga del sistema educativo de Bolivia (estándares RUE/SIE y Ley Avelino Siñani - Elizardo Pérez) con los modelos de la base de datos y la arquitectura técnica.

---

## Términos del Dominio Académico Boliviano

### 1. Gestión / Gestión Académica (`AcademicYear`)
Representa el año lectivo o escolar correspondiente (ej. *Gestión 2026*). Es el contenedor lógico y temporal más grande del sistema. Pasa por tres estados:
*   **PLANNING (Planificación):** Preparación previa del año (configuración de cursos, asignación de docentes y horarios). No permite transacciones operacionales como marcado de asistencia o subida de notas.
*   **ACTIVE (Activo):** El año escolar actual en curso. Permite todas las operaciones habituales. Solo puede haber una gestión activa a la vez.
*   **CLOSED (Cerrado):** Año histórico finalizado. Toda la información académica queda congelada como "Solo Lectura" para garantizar la inmutabilidad de los registros oficiales.

### 2. RUE (Registro Único de Establecimientos) / SIE (Sistema de Información Educativa)
Códigos e infraestructura del Ministerio de Educación de Bolivia:
*   **RUE Code / SIE Code:** Código identificador único oficial provisto por el Ministerio para cada unidad educativa (ej. `80730145`). En la base de datos, este código está representado en `rueCode` de la entidad `Institution`.
*   **Validación SIE:** Proceso por el cual el director de la escuela exporta y consolida las notas e inscripciones para cargarlas en los servidores del Ministerio de Educación.

### 3. RUDE (Registro Único de Estudiantes) (`RudeRecord` / `Student`)
Formulario socioeconómico y ficha de registro nacional obligatoria para cada estudiante en Bolivia. Contiene información multidimensional que incluye:
*   **Datos de Identidad y Origen:** Certificado de nacimiento (Oficialía, Libro, Partida, Folio), país y localidad de nacimiento.
*   **Capacidades Diferentes / Talento Extraordinario:** Registro formal de discapacidades (CODEPEDIS/IBC), dificultades de aprendizaje o coeficientes intelectuales destacados.
*   **Aspectos Socioeconómicos:** Acceso a servicios básicos (agua, luz, alcantarillado, internet), identidad cultural, lengua nativa y de uso diario, medios de transporte hacia el colegio, actividad laboral y razones de abandono escolar previo.

### 4. Paralelo o Curso (`Classroom`)
Representa la intersección física y lógica de un grupo de estudiantes. Se define mediante la combinación única de:
*   **Nivel Educativo (`EducationLevel`):** `INICIAL`, `PRIMARIA` o `SECUNDARIA`.
*   **Grado (`grade`):** Año correspondiente (ej. "Primero", "Sexto").
*   **Paralelo / Sección (`section`):** Letra que identifica el grupo (ej. "A", "B", "C").
*   **Turno (`Shift`):** `MANANA`, `TARDE` o `NOCHE`.

### 5. Carga Horaria (`TeacherAssignment`)
Asociación contractual y académica que asigna a un docente (`User` con rol `DOCENTE`) la enseñanza de una materia específica (`Subject`) en un paralelo determinado (`Classroom`) durante una gestión escolar. Representa el pivote para la creación de horarios y registro de calificaciones.

---

## Términos del Sistema de Calificaciones (Ley 070)

### 6. Dimensiones de Evaluación
El sistema califica el rendimiento del estudiante sobre 100 puntos en base a las dimensiones de la Ley 070 (Avelino Siñani - Elizardo Pérez). En el código, la distribución de puntajes máximos está configurada de la siguiente manera:
*   **SER (`scoreSer` - Max 10 puntos):** Evaluación del desarrollo de valores, ética y principios del estudiante.
*   **SABER (`scoreSaber` - Max 45 puntos):** Evaluación de conocimientos cognitivos y teorías adquiridas.
*   **HACER (`scoreHacer` - Max 40 puntos):** Evaluación de la aplicación práctica, habilidades y proyectos.
*   **AUTO (`scoreAuto` - Max 5 puntos):** Autoevaluación del estudiante, donde realiza una valoración propia de su desempeño.

### 7. Nota Consolidada y Reforzamiento (`totalScore` / `recoveryScore` / `finalScore`)
*   **Puntaje Total (`totalScore`):** La suma matemática de las cuatro dimensiones evaluadas (`SER + SABER + HACER + AUTO`).
*   **Nota Definitiva (`finalScore`):** Calificación final oficial del trimestre. Si el `totalScore` es mayor o igual a **51**, se aprueba el trimestre y la nota definitiva es igual al total.
*   **Nota de Recuperación (`recoveryScore`):** Instancia de reforzamiento académico aplicable únicamente si el `totalScore` es menor a 51. Si el estudiante aprueba el examen de recuperación, su nota final se actualiza, pero legalmente se limita (*caps*) a un máximo de **51** puntos.

### 8. Descongelamiento / Solicitud de Cambio de Nota (`GradeChangeRequest`)
Cuando un trimestre se cierra, las calificaciones pasan de estado `DRAFT` (Borrador) o `PUBLISHED` (Publicado) a `LOCKED` (Bloqueado). Si un docente necesita corregir una calificación bloqueada, debe iniciar una solicitud formal especificando el motivo del cambio y los nuevos puntajes propuestos. El cambio solo se aplica a la libreta si es aprobado explícitamente por el Director.

---

## Términos de Control y Operación Diaria

### 9. Casilla de Horario (`ScheduleSlot`)
Registro en la matriz de horarios que reserva un espacio para impartir una materia. Ocupa un día de la semana (`dayOfWeek` 1=Lunes a 5=Viernes) en un período específico (`ClassPeriod`) para una carga horaria (`TeacherAssignment`).

### 10. Reglas de Oro del Horario
Conjunto de restricciones únicas e inmutables implementadas a nivel de base de datos para prevenir conflictos físicos y temporales:
1.  **Regla de Curso:** Un paralelo no puede tener dos asignaturas diferentes en el mismo día y período.
2.  **Regla de Docente:** Un profesor no puede dictar clases en dos paralelos diferentes en el mismo día y período.

### 11. Cuarentena de Datos (`DataUpdateRequest`)
Flujo de seguridad para la actualización digital de datos del RUDE. Los tutores o estudiantes envían sus solicitudes de corrección de información socioeconómica desde la App móvil. Los datos propuestos entran en un estado de "cuarentena" (`PENDING`) y no se consolidan en el expediente escolar del estudiante hasta que secretaría o dirección los revise y apruebe.

### 12. Carnet QR (`IdentityCard` / `qrTokenVersion`)
Identificación digital generada asíncronamente para cada estudiante. Contiene un token cifrado y temporal. Si un estudiante pierde su carnet, se genera una nueva versión (`qrTokenVersion`) que invalida inmediatamente el código QR anterior para evitar suplantaciones de identidad.

### 13. Bloques de Asistencia y Justificaciones
*   **Periodo de Clase (`ClassPeriod`):** Franja horaria de clase o descanso (`isBreak`).
*   **Asistencia manual vs QR:** Métodos para tomar asistencia diaria. La asistencia puede ser marcada de forma manual por el profesor o automática mediante el escaneo del código QR del estudiante.
*   **Justificación:** Registro administrativo que permite excusar una falta (`ABSENT`) o retraso (`LATE`) del alumno por razones autorizadas (licencias médicas, familiares, etc.), modificando el estado del registro a `EXCUSED`.
