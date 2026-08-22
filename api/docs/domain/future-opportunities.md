# Oportunidades Futuras y Roadmap Funcional - UECG Backend

Este documento analiza los riesgos técnicos implícitos del backend de la Unidad Educativa Che Guevara (UECG), evalúa el estado de las funcionalidades incompletas/huérfanas e identifica oportunidades de automatización e Inteligencia Artificial aplicadas al negocio.

---

## 1. Reglas Ocultas y Riesgos Técnicos Detectados

### 1.1 Timezones UTC-4 Descentralizado
*   **Problema:** Aunque la asistencia realiza cálculos locales mediante un helper (`getSafeLocalDate()`), la base de datos almacena todas las marcas de tiempo (`createdAt`, `updatedAt`, `timestamp`) en formato UTC estándar. Si el servidor se despliega en una nube con una zona horaria distinta, las consultas de auditoría, las justificaciones de asistencia y el cierre trimestral podrían sufrir desajustes de hasta un día.
*   **Mitigación:** Centralizar el cálculo de zonas horarias en un interceptor global o forzar la variable de entorno `TZ=America/La_Paz` a nivel de contenedor/OS.

### 1.2 Dependencia Estática en Permisos Dinámicos
*   **Problema:** La base de datos almacena una tabla relacional de `Permission` vinculada a `RolePermission`. Sin embargo, la verificación en el código se realiza mediante el decorador estático `@RequirePermissions(SystemPermissions.READ_ALL_STUDENT)`. Si se añade un permiso nuevo a la constante del código, la base de datos requiere una migración manual de sincronización para que no falle el guard.
*   **Mitigación:** Implementar un sincronizador automático que verifique la constante en el inicio de la aplicación y cree los registros faltantes en la tabla `Permission` (un `seed` automático de arranque).

### 1.3 Custodia de Claves PII (`EncryptionService`)
*   **Problema:** Si el secreto `ENCRYPTION_KEY` de producción se pierde o se corrompe, todos los Carnets de Identidad de alumnos y tutores quedarán cifrados e ilegibles de forma permanente. No existe una estrategia de respaldo ni un plan de rotación de claves criptográficas.
*   **Mitigación:** Implementar esquemas de encriptación con envoltorio de claves (Key Wrapping) mediante servicios de nube gestionados (ej. Google Cloud KMS / AWS KMS).

---

## 2. Análisis de Módulos Huérfanos e Incompletos

### 2.1 Espacios Físicos (`physical-spaces`) — Estado: 🟡 Básico
*   **Situación actual:** Existe la entidad `PhysicalSpace` en base de datos y un controlador básico. Sin embargo, no está plenamente integrada con el calendario de horarios. La relación de espacio físico en `ScheduleSlot` es opcional y no se aplican validaciones estrictas que impidan la asignación del mismo laboratorio a dos docentes distintos a la misma hora si la base de datos no tiene una restricción única multi-columna.
*   **Acción de mejora:** Implementar una restricción única compuesta en `ScheduleSlot` sobre `[physicalSpaceId, dayOfWeek, classPeriodId]` (filtrando nulos) para evitar sobre-reservas físicas de salones y laboratorios.

### 2.2 Cuarentena de Datos (`data-updates`) — Estado: 🟡 Incompleto
*   **Situación actual:** La tabla `DataUpdateRequest` está creada y estructurada para almacenar las propuestas de cambios del RUDE hechas por los tutores en formato JSON (`proposedData`). No obstante, no existe una interfaz administrativa para que la secretaria o director valide, rechace o aplique de forma automatizada estos cambios.
*   **Acción de mejora:** Desarrollar el endpoint `PATCH /data-updates/:id/resolve` que, en caso de ser aprobado (`APPROVED`), parsee el JSON, actualice los campos correspondientes del estudiante y del tutor de forma transaccional, y notifique al móvil la consolidación de los datos.

---

## 3. Roadmap Funcional: Propuesta de Nuevas Características

```
                   Fases de Implementación del Producto
┌───────────────────────┐   ┌────────────────────────┐   ┌───────────────────────┐
│  FASE 1: INTEGRACIÓN  │   │  FASE 2: OPERACIONES   │   │  FASE 3: INTELIGENCIA │
│  • SIE/RUE Bulk Tools │   │  • Alertas WhatsApp    │   │  • AI Drop-out Risk   │
│  • Consola Cuarentena │   │  • Licencias Digitales │   │  • AI Timetable CSP   │
│  • Versionado de Notas│   │  • Director Dashboard  │   │  • Justificaciones NLP│
└───────────────────────┘   └────────────────────────┘   └───────────────────────┘
```

### 3.1 Integraciones y Automatización Académica (Fase 1)
*   **Generador Oficial SIE (.emp):** Exportador que tome las calificaciones consolidadas y las inscripciones del año activo y genere el archivo plano comprimido con la estructura oficial exigida por el Ministerio de Educación de Bolivia para la carga directa en el subsistema del SIE.
*   **Versionador e Historial de Calificaciones:** Crear una tabla de auditoría dedicada a cambios en notas (`GradeHistory`). Permite auditar qué valores anteriores tenían las dimensiones de la Ley 070 antes de una aprobación de cambio, mostrando el antes/después del rendimiento escolar.

### 3.2 Notificaciones Avanzadas y Workflows (Fase 2)
*   **Motor de Alertas Inmediatas por WhatsApp:** Integración con proveedores de mensajería (ej. Twilio API o WhatsApp Business) para notificar al tutor en tiempo real cuando un alumno no registre su entrada por QR en el primer período, mitigando el ausentismo no supervisado.
*   **Flujo Digital de Licencias Médicas y Permisos:** Permitir al tutor subir una foto del certificado médico o carta de justificación desde la App móvil. Esto genera una solicitud de justificación en estado pendiente para revisión de secretaría, la cual, al aprobarse, cambia el registro de asistencia del estudiante a `EXCUSED` automáticamente.
*   **Dashboard Directivo Integral:** Panel web interactivo para directores que muestre:
    *   Tasa global de asistencia diaria filtrable por grado/turno.
    *   Matrícula y capacidad disponible en tiempo real de toda la institución.
    *   Rendimiento y distribución de calificaciones (identificando materias con mayor índice de reprobación).

### 3.3 Inteligencia Artificial Aplicada al Dominio Escolar (Fase 3)

#### A. Analizador Predictivo de Deserción Escolar (Drop-out Risk Model)
*   **Problema:** Identificar estudiantes en riesgo de abandonar el colegio es una tarea reactiva que suele ocurrir cuando el alumno ya dejó de asistir.
*   **Solución IA:** Desarrollar un servicio en la nube que analice:
    1.  Variables socioeconómicas del RUDE (si el alumno trabaja, distancia en horas al colegio, tipo de vivienda, falta de internet).
    2.  Comportamiento de asistencia (tendencia de retrasos y faltas acumuladas en el trimestre).
    3.  Rendimiento escolar (calificaciones del SER/SABER/HACER bajo el promedio).
*   **Acción:** Clasificar a los estudiantes en niveles de riesgo (Bajo, Medio, Alto) y alertar al asesor del curso (`advisorId`) y a la dirección para que realicen intervenciones preventivas.

#### B. Generador Inteligente de Horarios (AI Timetable Solver)
*   **Problema:** Crear horarios para una escuela con múltiples turnos, docentes que trabajan en otros establecimientos y limitaciones físicas de laboratorios es una tarea compleja que toma semanas de planificación manual.
*   **Solución IA:** Utilizar algoritmos de Inteligencia Artificial de Satisfacción de Restricciones (Constraint Satisfaction Problems - CSP) para resolver los horarios de forma automatizada en segundos:
    *   **Restricciones duras:** Reglas de oro del backend (evitar cruces de profesor y curso).
    *   **Restricciones blandas:** Preferencias de turnos de docentes, agrupación de periodos en bloques de 2 horas seguidas (para evitar periodos huérfanos), y uso eficiente de laboratorios especializados.

#### C. Clasificador NLP de Justificaciones Médicas
*   **Problema:** La secretaría de la escuela gasta tiempo analizando y clasificando manualmente las notas de excusa de los padres.
*   **Solución IA:** Implementar un modelo de Procesamiento de Lenguaje Natural (NLP) integrado a la carga de licencias de la App. Al escanear la justificación, la IA extrae la causa principal (Enfermedad, Viaje, Fuerza Mayor), valida las fechas escritas en el documento y propone la aprobación pre-completada a la secretaría.
