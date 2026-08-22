# Prompt Reutilizable: Migración de Módulos (Next.js ──> React + Vite)

*Copie y envíe este prompt a un agente de Inteligencia Artificial para que realice la migración de un nuevo módulo o vista siguiendo rigurosamente las reglas del proyecto.*

---

```markdown
Actúa como Ingeniero Senior Frontend y especialista en migraciones de software.

Tu tarea es migrar de forma incremental el módulo/vista de `<NOMBRE_DEL_MÓDULO>` desde la antigua base de código (Next.js) hacia nuestro nuevo ecosistema React + Vite, adhiriéndote rigurosamente a las directivas de arquitectura y calidad establecidas en nuestro repositorio.

### Contexto del Módulo a Migrar
* **Nombre de la Feature:** `<NOMBRE_DE_LA_FEATURE>` (ej: `class-periods`)
* **Ubicación Antigua o Descripción del Flujo:** `<DESCRIBIR_DÓNDE_ESTABA_Y_QUÉ_HACÍA>`
* **Endpoints Relacionados:** `<LISTADO_DE_ENDPOINTS>`

---

### Instrucciones y Protocolo Obligatorio de 6 Pasos

Debes realizar la migración de manera incremental, archivo por archivo, sin realizar cambios masivos paralelos y asegurando compilar en cada paso. Sigue estrictamente esta secuencia:

#### Paso 1: Definición de Tipos e Infraestructura de API
* Crea el archivo de servicio en `src/features/<FEATURE_DIR>/api/<FEATURE_DIR>.service.ts`.
* Define interfaces de TypeScript 100% estrictas para los payloads de entrada y respuestas de la API. Está terminantemente prohibido usar `any`.
* Utiliza el cliente HTTP `api` de `@/shared/api/client` con soporte para cookies y refresco de tokens silencioso. Asegura desenvolver de forma segura los objetos envueltos en `.data` devueltos por el backend NestJS.

#### Paso 2: Co-localización de Hooks de Servidor (Server State)
* Crea el custom hook receptor en `src/features/<FEATURE_DIR>/hooks/use-<FEATURE_DIR>-data.ts`.
* Utiliza `@tanstack/react-query` (`useQuery` y `useMutation`).
* Define claves de consulta (`queryKey`) estructuradas y descriptivas.
* Encapsula aquí la lógica de debounces para búsqueda y placeholders para evitar parpadeos visuales al paginar.
* IMPORTANTE: En el callback `onSuccess` de las mutaciones, invalida explícitamente las claves de consulta correspondientes para forzar un refresco síncrono.

#### Paso 3: Esquemas de Validación de Formularios (Zod)
* Si el módulo requiere formularios o drawers de edición, crea el esquema en `src/features/<FEATURE_DIR>/schemas/` o co-localízalo de forma limpia.
* Utiliza `zod` para construir el esquema. Emplea `z.coerce.number()` para campos numéricos y `.refine()` para validaciones cruzadas complejas (ej. fechas de inicio y fin).
* Acopla el validador a React Hook Form usando `@hookform/resolvers/zod`.

#### Paso 4: Componentes de UI Presentacionales Puros
* Crea o migra los componentes visuales a `src/features/<FEATURE_DIR>/components/`.
* Ninguno de estos componentes debe invocar de manera directa a `useQuery` o `useMutation`. Deben recibir todos los datos y callbacks por props estrictamente tipados.
* Aplica el patrón Drawer utilizando `createPortal(..., document.body)` y `z-[9999]` para asegurar que los elementos flotantes no colisionen visualmente.
* Dota a la interfaz de micro-animaciones dinámicas de entrada/salida y springs en pestañas usando `framer-motion`.

#### Paso 5: Registro de Rutas en TanStack Router
* Registra la vista en la estructura de archivos en `src/app/router/`.
* Para optimizar el rendimiento y bundle, declara la definición de ruta de forma síncrona en `<RUTA>.tsx` y realiza la importación perezosa del componente principal en `<RUTA>.lazy.tsx` utilizando `createLazyFileRoute`.

#### Paso 6: Exportación de la API Pública
* Crea el archivo `src/features/<FEATURE_DIR>/index.ts`.
* Exporta de forma explícita y selectiva únicamente aquellos componentes, hooks y tipos que el enrutador de la aplicación o componentes externos necesitan consumir.

---

### Reglas de Calidad y Calificación
* **TypeScript Estricto:** Está terminantemente prohibido declarar tipos `any`.
* **Manejo de Errores:** Controla las excepciones de API en las mutaciones mostrando alertas visuales descriptivas mediante `toast` de `sonner`.
* **Cierre de Sesión:** Si detectas que se pierde la sesión o expira la sesión de refresco, delega en la función centralizada `kickUserOut` del cliente HTTP.

Comienza analizando el código antiguo y detalla cuál será tu plan de acción para cada uno de los 6 pasos antes de empezar a escribir código.
```
