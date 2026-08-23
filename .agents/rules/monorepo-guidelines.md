# 🏛️ Directrices y Reglas del Monorepo UECG

Este documento establece las reglas arquitectónicas, estándares de desarrollo, flujo de ramas Git y convenciones de commits para el monorepo de la **Unidad Educativa Colegio Che Guevara (UECG)**.

---

## 📁 1. Estructura de Proyectos y Responsabilidades

| Proyecto | Ruta | Stack Tecnológico | Arquitectura | Rol / Consumo | Destino de Despliegue |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`api`** | `/api` | NestJS v11, Prisma v7, PostgreSQL, Redis, BullMQ | Modular + DDD + ABAC | Backend central REST, SSE y FCM. Fuente única de verdad. | **Render** (`web_service`) |
| **`web-admin`** | `/web-admin` | React 19, Vite, TypeScript, TanStack Router, Tailwind CSS | Feature-Sliced Design (FSD) | Portal web de gestión administrativa y docente. Consume `api`. | **Netlify** (SPA) |
| **`mobile`** | `/mobile` | Flutter 3.x, Dart, Riverpod, GoRouter, Dio | Clean Architecture | App móvil para Estudiantes, Tutores y Docentes. Consume `api`. | Tiendas móviles (Android/iOS) |
| **`landing`** | `/landing` | Astro v5, TypeScript, Tailwind CSS | Static Site Generation (SSG) | Landing institucional informativa/demostrativa. No consume la API. | **Netlify** (Static) |

---

## 🌿 2. Flujo de Ramas (GitFlow) y Política de Historial

El repositorio sigue estrictamente el modelo **GitFlow** con política de preservación histórica de ramas:

1. **`main`**:
   - Rama de producción. Solo código estable, probado y listo para despliegue productivo.
   - Protegida contra push directo; se actualiza mediante merges de ramas `release/*` o `hotfix/*`.
2. **`develop`**:
   - Rama de integración principal para desarrollo activo.
   - Todas las nuevas características se originan e integran aquí.
3. **`feature/<scope>-<nombre-descriptivo>`**:
   - Ramas de características (ej. `feature/api-auth-biometrics`, `feature/mobile-offline-cache`, `feature/web-admin-grade-sheet`).
   - Se desprenden de `develop` y se integran mediante Pull Request hacia `develop`.
   - **Preservación Histórica Obligatoria**: **NO eliminar las ramas `feature/*` tras realizar el merge**. Deben mantenerse intactas como historial y trazabilidad del proyecto.
4. **`release/vX.Y.Z`**:
   - Ramas de estabilización y preparación de versiones.
   - Se crean desde `develop`, se pulen y se fusionan tanto en `main` como en `develop` (con tag de versión).
5. **`hotfix/<nombre-descriptivo>`**:
   - Parches urgentes para producción (ej. `hotfix/jwt-expiration-patch`).
   - Se crean directamente desde `main` y se fusionan en `main` y `develop`.

> [!NOTE]
> **Política de Retención de Ramas**: Para mantener una auditoría completa del ciclo de vida y desarrollo del código, no se debe activar la opción "Delete branch" tras completar merges o Pull Requests de ramas `feature/*`.

---

## 📝 3. Convención de Commits (Conventional Commits)

Todos los mensajes de commit deben seguir el estándar **Conventional Commits**:

```text
<tipo>(<scope>): <descripción corta en modo imperativo>

[cuerpo opcional detallando el motivo del cambio]

[pie de página opcional: referencias a issues / BREAKING CHANGES]
```

### Tipos Permitidos:
- **`feat`**: Nueva funcionalidad para el usuario/sistema.
- **`fix`**: Corrección de un bug o fallo.
- **`refactor`**: Refactorización de código sin alterar comportamiento externo.
- **`docs`**: Cambios exclusivos en documentación o comentarios.
- **`style`**: Ajustes de formato, espacios, comas, sin cambio de lógica.
- **`perf`**: Optimización de rendimiento o consumo de recursos.
- **`test`**: Creación o actualización de pruebas unitarias/integración.
- **`build`**: Modificaciones en herramientas de compilación o dependencias.
- **`ci`**: Cambios en workflows de CI/CD (GitHub Actions, pipelines).
- **`chore`**: Tareas de mantenimiento general o configuración de tooling.

### Scopes Comunes:
- `api`, `web-admin`, `mobile`, `landing`, `monorepo`, `auth`, `attendance`, `grades`, `users`, `identity`.

*Ejemplos:*
- `feat(api): add fcm push notification queue for attendance alerts`
- `fix(mobile): ensure secure storage token is purged on logout`
- `refactor(web-admin): convert grade sheet drawer to fsd component`
- `docs(monorepo): update cross-platform integration guidelines`

---

## 🔄 4. Regla de Oro: Integración Cruzada Backend ↔ Clientes

> [!IMPORTANT]
> **Verificación Bidireccional Obligatoria:**
> Debido a que tanto **`web-admin`** como **`mobile`** consumen la misma **`api`** con diferentes roles y flujos de autenticación:
> - Toda modificación en endpoints de autenticación, DTOs de request/response, permisos ABAC o esquemas de base de datos **debe ser verificada y validada tanto para `web-admin` como para `mobile`**.
> - La autenticación en `web-admin` maneja cookies HttpOnly (`uecg_access_token`) y fallback Bearer; en `mobile` opera exclusivamente mediante encabezado `Authorization: Bearer <token>`.

---

## 📐 5. Reglas Arquitectónicas por Proyecto

### Backend (`/api`):
- NestJS modular con inyección de dependencias.
- Prisma 7 como ORM tipado con PostgreSQL.
- DTOs estrictos con `class-validator` y `class-transformer`. Prohibido el uso de `user: any` o parámetros no tipados en servicios.
- Respuestas API estandarizadas `{ success: boolean, message: string, data?: T, error?: E }`.

### Web Admin (`/web-admin`):
- Feature-Sliced Design (FSD) / Feature-Driven Architecture (`src/app`, `src/features`, `src/shared`).
- Prohibida la lógica de negocio o llamadas API inline dentro de componentes UI (usar custom hooks co-localizados).
- Accesibilidad WCAG 2.1 AA (Portales, Focus-Trap, Tecla Escape, ARIA).

### Móvil (`/mobile`):
- Clean Architecture estricta:
  - `data/`: Modelos DTOs, fuentes de datos locales/remotas, implementaciones de repositorios.
  - `domain/`: Entidades de negocio puras, interfaces de repositorios, casos de uso.
  - `presentation/`: Widgets, pantallas, controladores Riverpod / Notifiers.
- Prohibido saltarse la capa de dominio o llamar a APIs directamente desde widgets.

### Landing Page (`/landing`):
- Astro estático, rápido y optimizado para SEO e identidad institucional.
- Mantener desacoplada de la API para garantizar máxima disponibilidad.

---

## 🚀 6. Destinos y Estrategia de Despliegue

- **`api`**: Desplegada en **Render** como `web_service` Node.js. Disparador automatizado vía Deploy Hook Webhook o GitHub Action ante merges en `main`.
- **`web-admin`**: Desplegado en **Netlify** como SPA con redirecciones en `netlify.toml`.
- **`landing`**: Desplegada en **Netlify** como sitio estático SSG.
