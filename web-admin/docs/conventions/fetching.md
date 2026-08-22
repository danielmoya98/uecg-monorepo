# Estrategia de Fetching - UECG React Vite

Este documento detalla los estándares de comunicación HTTP, manejo de sesiones, refresco automático de tokens y estructuración de clientes API en la aplicación.

## 1. Cliente HTTP Centralizado (Axios)

Toda comunicación saliente hacia la API REST del backend debe canalizarse de forma exclusiva a través de la instancia configurada de Axios en `src/shared/api/client.ts`.

### Reglas Críticas
* **Prohibición de Clientes Crudos:** Queda estrictamente prohibido el uso de la API nativa `fetch()` del navegador o importaciones directas de instancias de `axios` sin configurar en componentes o servicios de características.
* **Credenciales en Peticiones:** La instancia `api` debe mantener siempre habilitada la opción `withCredentials: true` para asegurar que las cookies de sesión (HTTP-only) se adjunten correctamente en las solicitudes cruzadas (CORS).

---

## 2. Gestión de Interceptores y Refresco de Tokens

El cliente de Axios incorpora una arquitectura de interceptores robusta para gestionar la caducidad de sesiones sin interrumpir la experiencia del usuario (Silent Token Refresh):

```
                       [ Petición Fallida (401) ]
                                   │
                     ¿Es /auth/refresh o reintento?
                      /                 \
                   [SÍ]                 [NO]
                    /                     \
             [Cerrar Sesión]      ¿Ya se está refrescando?
                                   /                 \
                                [SÍ]                 [NO]
                                 /                     \
                       [Encolar petición]      [Lanzar /auth/refresh]
                                                       /          \
                                                 [Éxito]         [Fallo]
                                                   /                 \
                                      [Reintentar cola]        [Cerrar Sesión]
```

### Funciones de Soporte
* **Cola de Espera (`failedQueue`):** Si una petición devuelve un estado `401 Unauthorized` mientras ya existe un proceso de refresco activo, esta se encola automáticamente y se resuelve/rechaza tan pronto como finalice la llamada de refresco.
* **Cierre Inmediato (`kickUserOut`):** Si falla la renovación del token (`/auth/refresh`), se limpian de inmediato las credenciales en `localStorage`, se expiran las cookies reactivas de login (`uecg_is_logged_in`) y se redirige síncronamente al usuario a la pantalla de acceso (`/`).

---

## 3. Estructura de Servicios de API (`service.ts`)

Cada módulo debe albergar sus servicios en `features/[feature]/api/[feature].service.ts`.

### Convenciones de Diseño
1. **Tipado Estricto de Payloads:** Todos los parámetros de entrada y mutaciones deben tiparse mediante interfaces precisas (ej. `AcademicYearPayload`).
2. **Desempaquetado NestJS Seguro:** Para protegernos de cambios estructurales en el backend, los servicios deben validar y extraer selectivamente los objetos envueltos en la propiedad `.data` del JSON de respuesta:
   ```typescript
   export const AcademicYearsService = {
     getAll: async (page: number, limit: number, search: string) => {
       const response = await api.get("/academic-years", {
         params: { page, limit, search },
       });
       return response.data.data !== undefined ? response.data.data : response.data;
     }
   }
   ```
