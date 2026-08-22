# Reglas de Migración Incremental - UECG React Vite

Este documento establece el protocolo secuencial obligatorio para migrar un nuevo módulo o vista desde la base de código antigua (Next.js) hacia el nuevo ecosistema React + Vite.

## Protocolo de Migración en 6 Pasos

Para garantizar que ningún módulo migrado degrade la estabilidad global, la migración debe realizarse siguiendo estrictamente el siguiente flujo:

```
   [1. DTO y API]    ──>   [2. Hooks de Datos]   ──>   [3. Esquemas de Forms]
         │                       │                           │
         ▼                       ▼                           ▼
  Servicio Axios           useQuery & useMutation        Zod + Hook Form
  en api/*.service.ts      en hooks/use-*.ts             en schemas/*

         │                       │                           │
         ▼                       ▼                           ▼
[4. Componentes UI]  ──>   [5. Ruta TanStack]    ──>   [6. API Pública index.ts]
  Puros y tipados,         lazyRouteComponent            Exportación del
  framer-motion            en app/router                 módulo en la raíz
```

---

### Paso 1: Definición de Tipos y Capa de API
* **Qué hacer:** Identificar los endpoints que consume el módulo.
* **Dónde:** Crear `features/[feature]/api/[feature].service.ts` y definir interfaces claras de payload y respuesta.
* **Regla:** Utilizar el cliente `api` de `@/shared/api/client` y desenvolver de manera segura las respuestas del servidor.

### Paso 2: Co-localización de Hooks de Servidor
* **Qué hacer:** Encapsular las consultas y mutaciones en hooks personalizados.
* **Dónde:** Crear `features/[feature]/hooks/use-[feature]-data.ts`.
* **Regla:** Utilizar `useQuery` o `useMutation`. Definir claves de caché (`queryKey`) semánticas y jerárquicas. Controlar los debounces de búsqueda y placeholder de datos aquí.

### Paso 3: Validación de Formularios y Esquemas Zod
* **Qué hacer:** Declarar las reglas de validación en el cliente.
* **Dónde:** Crear `features/[feature]/schemas/` o co-localizarlo si es de uso único en el drawer/formulario.
* **Regla:** Utilizar esquemas de Zod e inferir el tipo estricto (`z.infer<typeof schema>`) para alimentar React Hook Form.

### Paso 4: Creación de Componentes Presentacionales Puros
* **Qué hacer:** Diseñar los elementos visuales basándose en el sistema de diseño actual.
* **Dónde:** Crear `features/[feature]/components/`.
* **Regla:** Los componentes no deben invocar directamente llamadas al servidor. Reciben la información procesada y exponen eventos click/submit mediante callbacks tipados. Emplear `createPortal` para modales y animaciones fluidas con `framer-motion`.

### Paso 5: Registro de Rutas en TanStack Router
* **Qué hacer:** Registrar la nueva vista en la estructura de enrutamiento basado en archivos.
* **Dónde:** Crear el archivo de ruta en `src/app/router/`.
* **Regla:** Separar la definición de la ruta (`.tsx`) de su renderizado visual pesado (`.lazy.tsx`) para habilitar la carga diferida (*lazy loading*).

### Paso 6: Cierre y Exportación en `index.ts`
* **Qué hacer:** Crear la API pública de la feature.
* **Dónde:** Crear `src/features/[feature]/index.ts`.
* **Regla:** Exportar únicamente los elementos que el enrutador o componentes externos de la aplicación necesitan ver. Mantener el interior de la carpeta de la feature encapsulado.
