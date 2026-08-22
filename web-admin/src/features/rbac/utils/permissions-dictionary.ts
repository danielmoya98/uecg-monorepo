export interface PermissionInfo {
  module: string
  name: string
  desc: string
}

export const PERMISSIONS_DICT: Record<string, PermissionInfo> = {
  // --- 🏠 DASHBOARD (MÉTRICAS) ---
  'read:all:Dashboard': {
    module: '🏠 MÓDULO: PANEL PRINCIPAL',
    name: 'Ver Dashboard Global',
    desc: 'Permite visualizar estadísticas agregadas, total de alumnos inscritos, alertas críticas y resúmenes de asistencia institucional.',
  },
  'read:own:Dashboard': {
    module: '🏠 MÓDULO: PANEL PRINCIPAL',
    name: 'Ver Dashboard Personal',
    desc: 'Permite visualizar el panel personal, tareas pendientes, avisos particulares y estadísticas reducidas del docente.',
  },

  // --- 👩‍🏫 ASISTENCIA (ATTENDANCE) ---
  'create:own:Attendance': {
    module: '📋 MÓDULO: CONTROL DE ASISTENCIA',
    name: 'Tomar Asistencia Directa',
    desc: 'Habilita al docente a realizar el control de asistencia diario (pase de lista o escaneo de QR) de sus respectivos alumnos asignados.',
  },
  'read:all:Attendance': {
    module: '📋 MÓDULO: CONTROL DE ASISTENCIA',
    name: 'Ver Asistencias del Colegio',
    desc: 'Permite consultar el historial completo de asistencia y retrasos de cualquier estudiante de la institución.',
  },
  'manage:all:Attendance': {
    module: '📋 MÓDULO: CONTROL DE ASISTENCIA',
    name: 'Administrar Toda la Asistencia',
    desc: 'Control total de asistencia: permite justificar faltas, rectificar retrasos y modificar cualquier registro de asistencia.',
  },

  // --- 📝 CALIFICACIONES (GRADES) ---
  'update:own:Grade': {
    module: '📓 MÓDULO: LIBRETA DE NOTAS',
    name: 'Registrar Notas Propias',
    desc: 'Habilita al docente a subir, ponderar y promediar las calificaciones de los estudiantes en sus respectivas materias asignadas (Ley 070).',
  },
  'read:all:Grade': {
    module: '📓 MÓDULO: LIBRETA DE NOTAS',
    name: 'Ver Notas Globales',
    desc: 'Permite consultar el boletín o sábana de calificaciones generales de cualquier estudiante de la institución.',
  },
  'manage:all:Grade': {
    module: '📓 MÓDULO: LIBRETA DE NOTAS',
    name: 'Administración de Calificaciones',
    desc: 'Permite rectificar notas cerradas, validar centralizadores de evaluación y emitir certificados académicos oficiales.',
  },

  // --- 🏫 MATRICULACIÓN E INSCRIPCIONES (ENROLLMENTS) ---
  'read:all:Enrollment': {
    module: '✍️ MÓDULO: ADMISIONES E INSCRIPCIONES',
    name: 'Consultar Inscripciones',
    desc: 'Permite visualizar el listado de reservas, matrículas en curso y solicitudes de ingreso al centro educativo.',
  },
  'write:any:Enrollment': {
    module: '✍️ MÓDULO: ADMISIONES E INSCRIPCIONES',
    name: 'Inscribir Estudiantes',
    desc: 'Habilita a registrar nuevos alumnos en el ciclo lectivo, asignar paralelos y validar depósitos de matrícula.',
  },

  // --- 👥 POBLACIÓN ESCOLAR (STUDENTS) ---
  'read:all:Student': {
    module: '👥 MÓDULO: POBLACIÓN ESCOLAR',
    name: 'Ver Estudiantes (Global)',
    desc: 'Permite buscar y consultar fichas familiares, historiales disciplinarios y expedientes de cualquier alumno.',
  },
  'read:own:Student': {
    module: '👥 MÓDULO: POBLACIÓN ESCOLAR',
    name: 'Ver Estudiantes Propios',
    desc: 'Permite visualizar únicamente la información básica de contacto y rendimiento de los alumnos bajo tutela del docente.',
  },

  // --- 📇 CREDENCIALES (IDENTITY) ---
  'create:any:Identity': {
    module: '💳 MÓDULO: CREDENCIALES (QRs)',
    name: 'Generar Credenciales y QR',
    desc: 'Permite emitir e imprimir credenciales escolares físicas que contienen los códigos QR encriptados para el control biométrico.',
  },

  // --- ⚙️ INFRAESTRUCTURA Y PLANIFICACIÓN ACADÉMICA ---
  'manage:all:Classroom': {
    module: '⚙️ INFRAESTRUCTURA ACADÉMICA',
    name: 'Administrar Aulas y Cursos',
    desc: 'Permite definir los niveles de educación, crear paralelos (ej. 1º de Secundaria "A") e instrumentar asesores de curso.',
  },
  'manage:all:Subject': {
    module: '⚙️ INFRAESTRUCTURA ACADÉMICA',
    name: 'Administrar Catálogo de Materias',
    desc: 'Habilita a crear o dar de baja materias de la malla curricular general (ej. Matemática, Lenguaje, Física, etc.).',
  },
  'manage:all:TeacherAssignment': {
    module: '⚙️ INFRAESTRUCTURA ACADÉMICA',
    name: 'Administrar Asignación Docente',
    desc: 'Habilita a enlazar docentes con materias y aulas específicas, configurando su carga horaria institucional.',
  },
  'manage:all:Timetable': {
    module: '⚙️ INFRAESTRUCTURA ACADÉMICA',
    name: 'Administrar Calendario y Horarios',
    desc: 'Permite configurar el cronograma general de clases, los bloques de horas lectivas y resolver colisiones horarias.',
  },
  'manage:all:PhysicalSpace': {
    module: '⚙️ INFRAESTRUCTURA ACADÉMICA',
    name: 'Administrar Espacios Físicos',
    desc: 'Habilita a añadir laboratorios, canchas o aulas físicas en el mapa para asignar correctamente las locaciones del colegio.',
  },

  // --- 🔐 SEGURIDAD E INFRAESTRUCTURA CRÍTICA ---
  'manage:all:User': {
    module: '🔐 INFRAESTRUCTURA CRÍTICA (SEGURIDAD)',
    name: 'Gestionar Cuentas de Personal',
    desc: 'Permite crear cuentas para directivos, administrativos y docentes, suspender accesos o blanquear contraseñas.',
  },
  'manage:all:Role': {
    module: '🔐 INFRAESTRUCTURA CRÍTICA (SEGURIDAD)',
    name: 'Gestionar Roles y Permisos (RBAC)',
    desc: 'Control total de la matriz de políticas. Permite crear nuevos perfiles (ej. PSICOLOGO) y conceder o denegar habilidades del sistema.',
  },
  'read:all:Audit': {
    module: '🔐 INFRAESTRUCTURA CRÍTICA (SEGURIDAD)',
    name: 'Auditar Logs del Sistema',
    desc: 'Permite ver el historial inmutable de acciones críticas (inicios de sesión, borrado de notas, alteración de políticas) con marcas de tiempo.',
  },
  'manage:all:AcademicYear': {
    module: '📓 MÓDULO: GESTIÓN ACADÉMICA',
    name: 'Administrar Periodos de Clase',
    desc: 'Permite configurar trimesters, arrancar nuevos años de estudio y clausurar periodos lectivos.',
  },
  'manage:all:Institution': {
    module: '⚙️ CONFIGURACIÓN GLOBAL',
    name: 'Administrar Datos de la Institución',
    desc: 'Habilita a modificar el nombre del colegio, dirección, logos, sellos oficiales y configuraciones a nivel del sistema.',
  },
}
