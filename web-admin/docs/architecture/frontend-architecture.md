# Arquitectura Frontend - UECG React Vite

Este documento describe la arquitectura técnica del frontend para el proyecto UECG, migrado de Next.js a React + Vite.

## 1. Patrón Arquitectónico: Feature-Based (Por Módulos)

El código se organiza en torno a dominios de negocio o características (features) en lugar de capas técnicas globales. Cada dominio es autónomo y autosuficiente.

### Estructura de Directorios

```
src/
├── app/                  # Núcleo de la aplicación
│   ├── layouts/          # Layouts globales compartidos
│   ├── providers/        # Proveedores de contexto globales (Query, Auth, Helmet)
│   ├── router/           # Enrutamiento basado en archivos (TanStack Router)
│   └── styles/           # Configuración de estilos globales (index.css)
├── features/             # Características modulares de negocio
│   └── [feature-name]/
│       ├── api/          # Llamadas Axios y tipos de datos del backend
│       ├── components/   # Componentes exclusivos de la feature (UI y contenedores)
│       ├── hooks/        # Hooks de TanStack Query y lógica de negocio co-localizada
│       ├── schemas/      # Esquemas de validación Zod
│       ├── store/        # Estado del cliente exclusivo de la feature (Zustand)
│       ├── types/        # Tipados TypeScript estrictos
│       └── index.ts      # Punto de entrada público del módulo
└── shared/               # Recursos comunes reutilizables
    ├── components/       # Componentes genéricos de UI (botones, inputs, etc.)
    ├── hooks/            # Hooks generales de utilidad (useDebounce, etc.)
    ├── lib/              # Inicializaciones de librerías (axios, i18n, etc.)
    └── utils/            # Funciones puras de utilidad
```

---

## 2. Enrutamiento: TanStack Router

El enrutamiento está basado en archivos mediante `@tanstack/react-router` configurado en `vite.config.ts`.

* **Directorio de Rutas:** `src/app/router`
* **Árbol de Rutas Generado:** `src/routeTree.gen.ts` (automático)
* **Protección de Rutas:** Se realiza de forma reactiva pasando el contexto `isAuthenticated` y funciones de control de permisos (`can`, `canAny`) al enrutador en `src/app/router/router.tsx`.
* **Carga Perezosa (Lazy Loading):** Los componentes de ruta pesados deben dividirse en un archivo `.lazy.tsx` (ej. `academic-years.lazy.tsx`) que importa dinámicamente los componentes pesados del feature correspondiente, optimizando el tamaño del bundle inicial.

---

## 3. Estrategia de Gestión de Estado

El estado de la aplicación se divide estrictamente en dos categorías bien definidas:

### A. Estado del Servidor (Server State)
* **Tecnología:** `@tanstack/react-query`
* **Responsabilidad:** Datos de API, cacheado, sincronización en segundo plano, mutaciones y estado de carga/error del servidor.
* **Regla de Oro:** **Cualquier llamada HTTP debe encapsularse en un custom hook dentro de `features/[name]/hooks/`** usando `useQuery` o `useMutation`. Queda prohibido declarar `useQuery` directamente en componentes de UI.

### B. Estado del Cliente (Client State)
* **Tecnología:** `zustand` (para estados persistentes globales/modulares como sesión de usuario) y `useState` (para estados efímeros de UI como apertura de menús o pestañas activas).
* **Responsabilidad:** Configuración de visualización local, estados de UI complejos compartidos entre componentes hermanos y datos de sesión persistidos de forma segura.
