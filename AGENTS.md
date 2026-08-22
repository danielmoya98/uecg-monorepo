# 🏛️ Guía de Desarrollo para Agentes — UECG Monorepo

Este repositorio contiene la plataforma integral de la **Unidad Educativa Colegio Che Guevara (UECG)**.

## 📌 Reglas Fundamentales

1. **Flujo GitFlow**:
   - Trabajar siempre sobre `develop` o ramas `feature/<scope>-<nombre>`.
   - `main` es exclusiva para versiones de producción.
2. **Conventional Commits**:
   - Formato estricto: `<type>(<scope>): <descripción>` (ej. `feat(api): ...`, `fix(mobile): ...`, `refactor(web-admin): ...`).
3. **Verificación Cruzada de API (Web-Admin & Mobile)**:
   - Cualquier cambio en autenticación, endpoints o DTOs del backend (`/api`) DEBE validarse tanto para el cliente web (`/web-admin`) como para el cliente móvil (`/mobile`).
4. **Patrones Arquitectónicos**:
   - `/api`: Arquitectura Modular NestJS + Prisma + ABAC.
   - `/web-admin`: Feature-Sliced Design (FSD) + TanStack Router + Tailwind CSS.
   - `/mobile`: Clean Architecture (Data -> Domain -> Presentation) + Flutter Riverpod.
   - `/landing`: Astro SSG (desacoplada de la API).
5. **Despliegues**:
   - `api` → Render (`web_service`).
   - `web-admin` y `landing` → Netlify.

Para consultar el manual completo de directrices y estándares, ver [monorepo-guidelines.md](.agents/rules/monorepo-guidelines.md).
