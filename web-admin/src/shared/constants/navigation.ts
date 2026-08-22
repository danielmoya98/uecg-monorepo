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
} from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  desc?: string;
  permissions: string[];
  hideIfHas?: string[]; // El escudo anti-duplicados para ABAC
};

export const MASTER_SIDEBAR_LINKS: NavItem[] = [
  // --- 🏠 DASHBOARD PRINCIPAL ---
  {
    name: "Panel Principal",
    href: "/dashboard", // 🔥 Antes /admin/dashboard
    icon: LayoutGrid,
    desc: "Vista general y estado del sistema",
    permissions: ["read:all:Dashboard", "read:own:Dashboard"],
  },

  // --- 👨‍🏫 ÁREA OPERATIVA (Docentes) ---
  {
    name: "Mi Horario",
    href: "/timetables", // 🔥 Antes /admin/timetables
    icon: CalendarClock,
    desc: "Horario asignado",
    permissions: ["read:own:Timetable"],
    hideIfHas: ["manage:all:Timetable"],
  },
  {
    name: "Tomar Asistencia",
    href: "/attendance", // 🔥 Antes /admin/attendance
    icon: ClipboardCheck,
    desc: "Pase de lista y QR",
    permissions: ["create:own:Attendance"],
    hideIfHas: ["read:all:Attendance", "manage:all:Attendance"],
  },
  {
    name: "Libreta de Notas",
    href: "/grades", // 🔥 Antes /admin/grades
    icon: PenTool,
    desc: "Registro de notas Ley 070",
    permissions: ["update:own:Grade"],
    hideIfHas: ["read:all:Grade", "manage:all:Grade"],
  },

  // --- 🏫 ÁREA ADMINISTRATIVA (Secretaría / Dirección) ---
  {
    name: "Inscripciones",
    href: "/enrollments", // 🔥 Antes /admin/enrollments
    icon: UserCheck,
    desc: "Matriculación",
    permissions: ["read:all:Enrollment", "write:any:Enrollment"],
  },
  {
    name: "Población Escolar",
    href: "/students", // 🔥 Antes /admin/students
    icon: GraduationCap,
    desc: "Gestión de estudiantes",
    permissions: ["read:all:Student", "read:own:Student"],
  },
  {
    name: "Actualizaciones RUDE",
    href: "/data-updates", // 🔥 Antes /admin/data-updates
    icon: RefreshCcw,
    desc: "Bandeja de resoluciones de apoderados",
    permissions: ["read:all:Student"],
  },
  {
    name: "Carnetización (QRs)",
    href: "/identity", // 🔥 Antes /admin/identity
    icon: ScanFace,
    desc: "Generación masiva de credenciales",
    permissions: ["create:any:Identity"],
  },
  {
    name: "Control de Asistencia",
    href: "/attendance", // 🔥 Antes /admin/attendance (Mapeo Admin)
    icon: ClipboardCheck,
    desc: "Monitor en vivo del colegio",
    permissions: ["read:all:Attendance", "manage:all:Attendance"],
  },
  {
    name: "Sábanas de Notas",
    href: "/grades", // 🔥 Antes /admin/grades (Mapeo Admin)
    icon: BookOpen,
    desc: "Reportes globales de calificaciones",
    permissions: ["read:all:Grade"],
  },

  // --- ⚙️ CONFIGURACIÓN ACADÉMICA (Dirección) ---
  {
    name: "Cursos y Paralelos",
    href: "/classrooms", // 🔥 Antes /admin/classrooms
    icon: Users,
    desc: "Gestión de aulas",
    permissions: ["manage:all:Classroom"],
  },
  {
    name: "Materias",
    href: "/subjects", // 🔥 Antes /admin/subjects
    icon: BookOpen,
    desc: "Catálogo de materias",
    permissions: ["manage:all:Subject"],
  },
  {
    name: "Carga Horaria",
    href: "/teacher-assignments", // 🔥 Antes /admin/teacher-assignments
    icon: CalendarClock,
    desc: "Asignación docente",
    permissions: ["manage:all:TeacherAssignment"],
  },
  {
    name: "Gestión de Horarios",
    href: "/timetables", // 🔥 Antes /admin/timetables (Mapeo Admin)
    icon: CalendarClock,
    desc: "Armado de horarios generales",
    permissions: ["manage:all:Timetable"],
  },
  {
    name: "Espacios Físicos",
    href: "/physical-spaces", // 🔥 Antes /admin/physical-spaces
    icon: MapPin,
    desc: "Aulas, laboratorios y canchas",
    permissions: ["manage:all:PhysicalSpace"],
  },

  // --- 🔐 ZONA ROOT (Super Admin) ---
  {
    name: "Cuentas de Personal",
    href: "/users", // 🔥 Antes /admin/users
    icon: UsersRound,
    desc: "Administradores y Docentes",
    permissions: ["manage:all:User"],
  },
  {
    name: "Control de Accesos",
    href: "/rbac", // 🔥 Antes /admin/rbac
    icon: ShieldAlert,
    desc: "Roles y Matriz de Permisos",
    permissions: ["manage:all:Role"],
  },
  {
    name: "Auditoría",
    href: "/audit", // 🔥 Antes /admin/audit
    icon: ActivitySquare,
    desc: "Logs y trazabilidad",
    permissions: ["read:all:Audit"],
  },
];
