# 💻 UECG Web Admin — Portal Administrativo y Académico

Portal web de administración escolar y gestión pedagógica para la **Unidad Educativa Colegio Che Guevara (UECG)**.

---

## 🏗️ Arquitectura y Tecnologías

- **Framework:** React 19 + Vite + TypeScript (Modo Estricto)
- **Arquitectura:** **Feature-Sliced Design (FSD)** / Modular por Características
- **Enrutamiento y Estado:** TanStack Router (enrutamiento tipado y guards síncronos) + TanStack Query
- **Estilos y Componentes:** Tailwind CSS + Radix UI + Framer Motion (Diseño Suizo con portales y animaciones accesibles)
- **Formularios & Validación:** React Hook Form + Zod
- **Generación Documental:** `@react-pdf/renderer` para previsualización e impresión de carnets y reportes
- **Accesibilidad:** WCAG 2.1 AA (Focus Traps, soporte completo de teclado y atajos CTRL+K)

---

## 📁 Estructura del Código (Feature-Sliced Design)

```
src/
├── app/                  # Providers globales, layout maestro, router y estilos base
├── features/             # Módulos de negocio desacoplados
│   ├── auth/             # Sesión, login, recuperación y persistencia segura
│   ├── academic-years/   # Ciclos lectivos y apertura/cierre
│   ├── attendance/       # Estación QR, registro manual y licencias
│   ├── classrooms/       # Aulas, cursos, grados y paralelos
│   ├── data-updates/     # Bandeja de actualización de datos RUDE
│   ├── enrollments/      # Proceso de inscripción y formulario RUDE 4 pasos
│   ├── grades/           # Registro de notas Ley 070 y descongelamiento
│   ├── identity/         # Centro de carnetización digital e impresión
│   ├── institutions/     # Datos institucionales y RUE
│   ├── rbac/             # Roles, permisos y matriz de privilegios
│   ├── reports/          # Boletines y libretas de calificaciones
│   ├── subjects/         # Catálogo de materias
│   ├── teacher-assignments/ # Asignación de docentes y carga horaria
│   ├── timetables/       # Matriz de horarios con Drag & Drop
│   └── users/            # Gestión de cuentas y credenciales
└── shared/               # UI components, cliente HTTP Axios, helpers e interfaces globales
```

---

## 🚀 Inicio Rápido

```bash
# 1. Configuración de variables de entorno
cp .env.example .env

# 2. Instalación de dependencias
npm install

# 3. Servidor de desarrollo
npm run dev

# 4. Compilación para producción
npm run build
```

---

## 🌐 Despliegue

La aplicación se despliega como una Single Page Application (SPA) en **Netlify** con configuración de rutas y cabeceras seguras en `netlify.toml`.
