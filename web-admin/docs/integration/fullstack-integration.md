# Guía de Integración y Contratos de Datos — UECG Frontend

Este documento detalla las normas de integración, los contratos API y los esquemas de intercambio de información entre el frontend y el backend de la plataforma UECG.

---

## 1. Patrón de Envuelve de Respuesta (Response Envelope)

El backend NestJS unifica todas las respuestas bajo un sobre común.

```typescript
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Deuda Técnica de Integración Detectada
Actualmente, los servicios del frontend ejecutan desempaquetado manual repetitivo:
```typescript
return response.data.data !== undefined ? response.data.data : response.data;
```
**Solución Planificada (Roadmap):** Centralizar este desempaquetado en el interceptor global de Axios en `src/shared/api/client.ts`.

---

## 2. Autenticación y Cookies HttpOnly

La comunicación requiere cookies para adjuntar los tokens JWT de manera segura.

* **sameSite:** `'lax'` (desarrollo) / `'none'` (producción).
* **withCredentials:** `true` (obligatorio en todas las peticiones Axios).

### Gestión de Errores de Autenticación (401)
El cliente Axios intercepta automáticamente respuestas `401 Unauthorized` y:
1. Si la petición fallida era `/auth/refresh`, limpia el estado local y expulsa al usuario (`kickUserOut`).
2. Si es otra petición, detiene el flujo, encola las peticiones concurrentes y lanza un `/auth/refresh` silencioso. Si tiene éxito, vacía la cola reintentando los requests originales con el nuevo token.

---

## 3. Integración por Módulos Críticos

### A. Periodos de Clase (`class-periods`)
* **Ubicación Correcta:** `src/features/class-periods`
* **Contrato API:**
  * `GET /api/v1/class-periods?shift=` (Lectura de periodos del turno)
  * `POST /api/v1/class-periods` (Crear periodo)
  * `DELETE /api/v1/class-periods/:id` (Eliminar periodo)
* **Regla de Integración:** Queda prohibida la eliminación por manipulación simulada en caché local. Toda eliminación debe disparar la mutación real hacia el backend.

### B. Calificaciones (`grades`)
* **Lógica de Sincronización:**
  * Las planillas se cargan a través del hook customizado `useGradesWorkspace`.
  * Toda mutación exitosa a nivel masivo (`PUT /api/v1/grades/bulk`) invalida de inmediato la Query Key `['grades', assignmentId, trimesterId]`.
  * Las peticiones de descongelamiento de notas usan `POST /api/v1/grades/change-requests` y notifican asíncronamente al Director mediante colas en segundo plano BullMQ.
