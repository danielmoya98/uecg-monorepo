export interface TourStepConfig {
  id: string
  stepNumber: number
  route: string
  selector: string
  fallbackSelector: string
  title: string
  description: string
  actionHint: string
  actionButtonSelector?: string
  actionButtonLabel?: string
}

export const DIRECTOR_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'intro',
    stepNumber: 0,
    route: '/dashboard',
    selector: '#tour-year-selector',
    fallbackSelector: '#tour-year-selector',
    title: '🏛️ Bienvenida a la Gestión Escolar',
    description:
      'Aquí seleccionas y visualizas el año escolar activo. Todas las aulas, materias, profesores y notas corresponden a la gestión seleccionada aquí.',
    actionHint:
      'Iniciaremos un recorrido interactivo guiado de 8 pasos para estructurar el colegio.',
  },
  {
    id: 'academic_year',
    stepNumber: 1,
    route: '/academic-years',
    selector: '#btn-new-academic-year',
    fallbackSelector: '[data-tour="tour-nav-academic-years"]',
    title: '1. Ciclo Lectivo & Trimestres',
    description:
      'El primer paso fundamental: Define la fecha de inicio y fin de clases, y asegura los 3 trimestres de evaluación según la Ley 070.',
    actionHint:
      'Haz clic en "+ Nueva Gestión" para abrir el formulario y registrar el año.',
    actionButtonSelector: '#btn-new-academic-year',
    actionButtonLabel: 'Abrir Formulario de Gestión',
  },
  {
    id: 'classrooms',
    stepNumber: 2,
    route: '/classrooms',
    selector: '#btn-new-classroom',
    fallbackSelector: '[data-tour="tour-nav-classrooms"]',
    title: '2. Cursos y Paralelos',
    description:
      'Crea las aulas del año (Inicial, Primaria, Secundaria). Puedes registrar aula por aula o usar "Creación Masiva / Clonar" para copiar la estructura del año pasado con 1 clic.',
    actionHint:
      'Pulsa "+ Nueva Aula" para crear un paralelo o "Creación Masiva" para clonar.',
    actionButtonSelector: '#btn-new-classroom',
    actionButtonLabel: 'Crear Primera Aula',
  },
  {
    id: 'catalog_spaces',
    stepNumber: 3,
    route: '/subjects',
    selector: '#btn-new-subject',
    fallbackSelector: '[data-tour="tour-nav-subjects"]',
    title: '3. Catálogo de Materias',
    description:
      'Verifica el catálogo curricular: Matemáticas, Lenguaje, Ciencias, etc. Cada materia debe tener asignada su área y campo de saberes.',
    actionHint:
      'Puedes agregar nuevas materias extracurriculares o técnicas en cualquier momento.',
    actionButtonSelector: '#btn-new-subject',
    actionButtonLabel: 'Ver / Agregar Materia',
  },
  {
    id: 'teacher_assignments',
    stepNumber: 4,
    route: '/teacher-assignments',
    selector: '#btn-link-teacher-assignment',
    fallbackSelector: '[data-tour="tour-nav-teacher-assignments"]',
    title: '4. Carga Horaria Docente',
    description:
      'Vincula a cada profesor con las materias que dictará en cada curso. Esto es vital: permite que el docente vea sus listas de estudiantes en la App Móvil.',
    actionHint:
      'Selecciona el curso, la materia y el profesor, luego haz clic en "Vincular".',
    actionButtonSelector: '#btn-link-teacher-assignment',
    actionButtonLabel: 'Probar Formulario de Vinculación',
  },
  {
    id: 'timetables',
    stepNumber: 5,
    route: '/timetables',
    selector: '#btn-export-timetables',
    fallbackSelector: '[data-tour="tour-nav-timetables"]',
    title: '5. Matriz de Horarios Semanales',
    description:
      'Arma la grilla de clases de lunes a viernes. El sistema detecta y evita automáticamente cualquier choque de horas entre docentes o aulas físicas.',
    actionHint:
      'Haz clic en cualquier aula para abrir su grilla y arrastrar las materias a cada periodo.',
  },
  {
    id: 'enrollments',
    stepNumber: 6,
    route: '/enrollments',
    selector: '#btn-new-enrollment',
    fallbackSelector: '[data-tour="tour-nav-enrollments"]',
    title: '6. Matriculación de Estudiantes',
    description:
      'Inscribe a los estudiantes en sus cursos respectivos. Puedes realizar inscripciones individuales en ventanilla o usar la importación masiva RUDE.',
    actionHint:
      'Usa "+ Inscripción Manual" para matricular un alumno con el formulario RUDE oficial.',
    actionButtonSelector: '#btn-new-enrollment',
    actionButtonLabel: 'Abrir Ficha RUDE',
  },
  {
    id: 'identity',
    stepNumber: 7,
    route: '/identity',
    selector: '#btn-generate-cards',
    fallbackSelector: '[data-tour="tour-nav-identity"]',
    title: '7. Carnetización QR',
    description:
      'Genera e imprime masivamente los carnets estudiantiles con código QR para el control de asistencia y acceso al colegio.',
    actionHint:
      'Selecciona los cursos y pulsa "Ejecutar Generación" para descargar los carnets en PDF listos para imprenta.',
    actionButtonSelector: '#btn-generate-cards',
    actionButtonLabel: 'Generar Carnets',
  },
  {
    id: 'first_trimester',
    stepNumber: 8,
    route: '/academic-years',
    selector: '#btn-new-academic-year',
    fallbackSelector: '[data-tour="tour-nav-academic-years"]',
    title: '8. Apertura del 1er Trimestre (¡Colegio Listo!)',
    description:
      '¡Último paso! Cuando las clases comiencen oficialmente, abre el 1er Trimestre en el cajón de trimestres para que los profesores puedan registrar notas y pases de lista.',
    actionHint:
      '¡Felicitaciones! Con esto el colegio queda 100% operativo y listo para el año escolar.',
  },
]
