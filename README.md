# 🏛️ UECG Monorepo — Plataforma Educativa Integral

Bienvenido al repositorio central de la **Unidad Educativa Colegio Che Guevara (UECG)**. Este monorepo alberga todos los componentes del ecosistema digital institucional: backend central de servicios académicos, portal administrativo web, aplicación móvil multiplataforma y portal web informativo.

---

## 🗺️ Mapa del Ecosistema

```
uecg-monorepo/
├── api/          # ⚙️ Backend REST API (NestJS + Prisma + PostgreSQL + Redis + BullMQ)
├── web-admin/    # 💻 Portal Administrativo & Docente (React 19 + Vite + TanStack Router + Tailwind)
├── mobile/       # 📱 App Móvil para Estudiantes, Tutores y Docentes (Flutter + Riverpod)
└── landing/      # 🌐 Landing Page Institucional (Astro v5 + SSG)
```

---

## 📊 Resumen de Componentes

| Proyecto | Directorio | Stack Tecnológico | Arquitectura | Rol / Consumo | Destino Despliegue |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend API** | [`api/`](api/) | NestJS 11, Prisma 7, PostgreSQL, Redis, BullMQ | Modular + DDD + ABAC | Núcleo de datos, auth, reportes PDF y tiempo real (SSE/FCM). Consumido por `web-admin` y `mobile`. | **Render** (`web_service`) |
| **Web Admin** | [`web-admin/`](web-admin/) | React 19, Vite, TypeScript, TanStack Router | Feature-Sliced Design (FSD) | Gestión académica, inscripciones RUDE, calificaciones, horarios y carnets. | **Netlify** (SPA) |
| **Mobile App** | [`mobile/`](mobile/) | Flutter 3.x, Dart, Riverpod, GoRouter, Dio | Clean Architecture | Portal móvil para tutores, estudiantes y profesores (asistencia QR, notas, avisos). | App Stores (Android / iOS) |
| **Landing Page** | [`landing/`](landing/) | Astro 5, TypeScript, Tailwind CSS | Static Site Generation (SSG) | Sitio público institucional, noticias, admisiones y proyectos. | **Netlify** (Static) |

---

## 🌿 Flujo de Ramas (GitFlow) y Commits

El desarrollo en este repositorio sigue estrictamente el modelo **GitFlow** y la especificación **Conventional Commits**:

- **`main`**: Rama de producción lista para despliegues.
- **`develop`**: Rama de integración donde converge el trabajo activo.
- **`feature/<scope>-<nombre>`**: Nuevas características creadas desde `develop`.
- **`release/vX.Y.Z`**: Preparación de versiones.
- **`hotfix/<nombre>`**: Correcciones críticas urgentes desde `main`.

### Formato de Commits:
```text
<tipo>(<scope>): <descripción concisa>
```
*Ejemplos:*
- `feat(api): implement push notification queue for attendance`
- `fix(mobile): flush secure storage on user logout`
- `refactor(web-admin): migrate timetable matrix to fsd feature structure`
- `docs(monorepo): update deployment and integration guide`

> Para más detalles, consulta la [Guía de Directrices del Monorepo](.agents/rules/monorepo-guidelines.md).

---

## 🚀 Despliegues y CI/CD

El monorepo cuenta con flujos automatizados en GitHub Actions:

- **CI (`.github/workflows/ci.yml`)**: Validación automática de compilación, análisis estático y suites de pruebas ante cambios en `main`, `develop` o Pull Requests.
- **API Backend**: Desplegado en **Render** mediante Deploy Hooks automáticos (`.github/workflows/deploy-render-api.yml`).
- **Web Admin**: Desplegado en **Netlify** con configuración SPA (`.github/workflows/deploy-netlify-web-admin.yml`).
- **Landing Page**: Desplegado en **Netlify** como sitio estático optimizado (`.github/workflows/deploy-netlify-landing.yml`).

---

## 🛠️ Requisitos e Instalación Local

### Prerrequisitos:
- **Node.js** >= 20.x
- **pnpm** / **npm**
- **Flutter SDK** >= 3.x (para desarrollo en `mobile/`)
- **PostgreSQL** & **Redis** (para desarrollo local en `api/`)

### Inicialización rápida:

```bash
# 1. Clonar el repositorio
git clone https://github.com/danielmoya98/uecg-monorepo.git
cd uecg-monorepo

# 2. Levantar Backend API
cd api
cp .env.example .env
npm install
npx prisma generate
npm run start:dev

# 3. Levantar Web Admin
cd ../web-admin
cp .env.example .env
npm install
npm run dev

# 4. Levantar Landing Page
cd ../landing
npm install
npm run dev

# 5. Ejecutar App Móvil
cd ../mobile
flutter pub get
flutter run
```

---

## 📚 Documentación Técnica por Módulo

- 📖 [Documentación Técnica de la API](api/docs/README.md)
- 📖 [Arquitectura Frontend Web Admin](web-admin/docs/architecture/frontend-architecture.md)
- 📖 [Arquitectura Móvil Clean Architecture](mobile/docs/architecture/README.md)
- 📖 [Estado y Auditoría del Backend](api/PROJECT_STATE.md)
- 📖 [Estado de Migración Web Admin](web-admin/PROJECT_STATE.md)
- 📖 [Estado Actual de la App Móvil](mobile/PROJECT_STATE.md)
