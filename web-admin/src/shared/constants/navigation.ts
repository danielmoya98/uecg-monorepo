import {
  LayoutGrid,
  BookOpen,
  Users,
  CalendarClock,
  UserCheck,
  GraduationCap,
  MapPin,
  type LucideIcon,
  ScanFace,
  ClipboardCheck,
  PenTool,
  ShieldAlert,
  ActivitySquare,
  UsersRound,
  RefreshCcw,
  CalendarDays,
  Settings,
} from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  desc?: string;
  permissions: string[];
  hideIfHas?: string[]; // El escudo anti-duplicados para ABAC
};

export type NavCategory = {
  id: string;
  title: string;
  icon?: LucideIcon;
  items: NavItem[];
};

export const MASTER_SIDEBAR_CATEGORIES: NavCategory[] = [
  // --- 🏠 PANEL PRINCIPAL ---
  {
    id: "main",
    title: "Inicio",
    items: [
      {
        name: "Panel Principal",
        href: "/dashboard",
        icon: LayoutGrid,
        desc: "Vista general y estado del sistema",
        permissions: ["read:all:Dashboard", "read:own:Dashboard"],
      },
    ],
  },

  // --- 👨‍🏫 GESTIÓN DE AULA (Docentes) ---
  {
    id: "classroom_ops",
    title: "Gestión de Aula",
    items: [
      {
        name: "Mi Horario",
        href: "/timetables",
        icon: CalendarClock,
        desc: "Horario asignado",
        permissions: ["read:own:Timetable"],
        hideIfHas: ["manage:all:Timetable"],
      },
      {
        name: "Tomar Asistencia",
        href: "/attendance",
        icon: ClipboardCheck,
        desc: "Pase de lista y QR",
        permissions: ["create:own:Attendance"],
        hideIfHas: ["read:all:Attendance", "manage:all:Attendance"],
      },
      {
        name: "Libreta de Notas",
        href: "/grades",
        icon: PenTool,
        desc: "Registro de notas Ley 070",
        permissions: ["update:own:Grade"],
        hideIfHas: ["read:all:Grade", "manage:all:Grade"],
      },
    ],
  },

  // --- 🏫 SECRETARÍA Y ALUMNADO ---
  {
    id: "secretariat",
    title: "Secretaría & Alumnos",
    items: [
      {
        name: "Inscripciones",
        href: "/enrollments",
        icon: UserCheck,
        desc: "Matriculación",
        permissions: ["read:all:Enrollment", "write:any:Enrollment"],
      },
      {
        name: "Población Escolar",
        href: "/students",
        icon: GraduationCap,
        desc: "Gestión de estudiantes",
        permissions: ["read:all:Student", "read:own:Student"],
      },
      {
        name: "Actualizaciones RUDE",
        href: "/data-updates",
        icon: RefreshCcw,
        desc: "Bandeja de resoluciones de apoderados",
        permissions: ["read:all:Student"],
      },
      {
        name: "Carnetización (QRs)",
        href: "/identity",
        icon: ScanFace,
        desc: "Generación masiva de credenciales",
        permissions: ["create:any:Identity"],
      },
      {
        name: "Control de Asistencia",
        href: "/attendance",
        icon: ClipboardCheck,
        desc: "Monitor en vivo del colegio",
        permissions: ["read:all:Attendance", "manage:all:Attendance"],
      },
      {
        name: "Sábanas de Notas",
        href: "/grades",
        icon: BookOpen,
        desc: "Reportes globales de calificaciones",
        permissions: ["read:all:Grade"],
      },
    ],
  },

  // --- ⚙️ PLANIFICACIÓN ACADÉMICA ---
  {
    id: "academic_planning",
    title: "Planificación Académica",
    items: [
      {
        name: "Gestiones Escolares",
        href: "/academic-years",
        icon: CalendarDays,
        desc: "Ciclos lectivos y trimestres",
        permissions: ["manage:all:AcademicYear", "read:all:AcademicYear"],
      },
      {
        name: "Cursos y Paralelos",
        href: "/classrooms",
        icon: Users,
        desc: "Gestión de aulas",
        permissions: ["manage:all:Classroom"],
      },
      {
        name: "Materias",
        href: "/subjects",
        icon: BookOpen,
        desc: "Catálogo de materias",
        permissions: ["manage:all:Subject"],
      },
      {
        name: "Carga Horaria",
        href: "/teacher-assignments",
        icon: CalendarClock,
        desc: "Asignación docente",
        permissions: ["manage:all:TeacherAssignment"],
      },
      {
        name: "Gestión de Horarios",
        href: "/timetables",
        icon: CalendarClock,
        desc: "Armado de horarios generales",
        permissions: ["manage:all:Timetable"],
      },
      {
        name: "Espacios Físicos",
        href: "/physical-spaces",
        icon: MapPin,
        desc: "Aulas, laboratorios y canchas",
        permissions: ["manage:all:PhysicalSpace"],
      },
    ],
  },

  // --- 🔐 SISTEMA Y SEGURIDAD ---
  {
    id: "system_security",
    title: "Sistema & Seguridad",
    items: [
      {
        name: "Cuentas de Personal",
        href: "/users",
        icon: UsersRound,
        desc: "Administradores y Docentes",
        permissions: ["manage:all:User"],
      },
      {
        name: "Control de Accesos",
        href: "/rbac",
        icon: ShieldAlert,
        desc: "Roles y Matriz de Permisos",
        permissions: ["manage:all:Role"],
      },
      {
        name: "Auditoría",
        href: "/audit",
        icon: ActivitySquare,
        desc: "Logs y trazabilidad",
        permissions: ["read:all:Audit"],
      },
      {
        name: "Configuración",
        href: "/settings",
        icon: Settings,
        desc: "Ajustes del colegio",
        permissions: ["manage:all:Institution", "read:all:Institution"],
      },
    ],
  },
];

// Compatibilidad hacia atrás
export const MASTER_SIDEBAR_LINKS: NavItem[] = MASTER_SIDEBAR_CATEGORIES.flatMap(
  (cat) => cat.items
);
