# Prompt: Integration Review

> Usar este prompt cuando se necesite verificar la integración frontend ↔ backend antes de un release o migración.

---

## Instrucciones para el Agente

Verifica la compatibilidad de la integración entre el frontend React + Vite y el backend NestJS para la funcionalidad `[describir funcionalidad]`.

---

## Checklist de Integración

### Autenticación y Sesión

- [ ] ¿El frontend usa `withCredentials: true` (Axios) o `credentials: 'include'` (fetch)?
- [ ] ¿El interceptor de refresh token está configurado en el cliente HTTP?
- [ ] ¿El frontend maneja el caso `status: 'SETUP_REQUIRED'` en login?
- [ ] ¿El logout limpia el estado local del usuario?
- [ ] ¿La verificación de sesión activa se ejecuta al montar la app?

### Contratos de Datos

- [ ] ¿Los tipos TypeScript del frontend coinciden con las respuestas del backend?
- [ ] ¿El frontend maneja correctamente el wrapper `{ success, data, message }`?
- [ ] ¿El frontend maneja el wrapper de error `{ success: false, error: { code, message } }`?
- [ ] ¿Los enums (AcademicStatus, EnrollmentStatus, etc.) son iguales en ambos lados?
- [ ] ¿Las fechas se manejan correctamente (ISO 8601)?

### Paginación

- [ ] ¿El frontend envía `page` y `limit` como query params?
- [ ] ¿El frontend lee `meta.totalPages` para la paginación de UI?
- [ ] ¿El frontend maneja la respuesta `data: []` cuando no hay resultados?

### Permisos en UI

- [ ] ¿El frontend lee `user.permissions` del estado de auth para condicionar la UI?
- [ ] ¿Los roles están mapeados correctamente a vistas/acciones en el frontend?
- [ ] ¿El frontend no asume permisos que el backend puede denegar?

### Manejo de Errores

- [ ] ¿El frontend captura y muestra mensajes de error del backend?
- [ ] ¿Los errores 401 (expiración) disparan el refresh automático?
- [ ] ¿Los errores 403 muestran un mensaje adecuado (no redirigen al login)?
- [ ] ¿Los errores de validación (400) muestran el mensaje del campo específico?

### CORS

- [ ] ¿El origen del frontend está en la lista de CORS permitidos del backend?
- [ ] ¿El frontend usa la URL correcta (`VITE_API_URL`)?
- [ ] ¿No hay peticiones cross-origin con cookies que fallen por `SameSite`?

---

## Verificaciones Específicas por Flujo

### Flujo de Login
```
1. Frontend POST /auth/login { email, password }
2. Backend retorna { status: 'SUCCESS', user: {...} } + SET cookies
3. Frontend almacena user en estado global (NO en localStorage)
4. Si status === 'SETUP_REQUIRED': frontend redirige a /setup-password?token=...
```

### Flujo de Solicitud Autenticada
```
1. Frontend hace request con credentials: 'include'
2. Cookie uecg_access_token viaja automáticamente
3. Backend valida JWT → popula req.user
4. Backend retorna { success: true, data: {...} }
5. Frontend lee response.data.data
```

### Flujo de Refresh Silencioso
```
1. Request retorna 401
2. Interceptor hace POST /auth/refresh (credentials: 'include')
3. Backend valida cookie uecg_refresh_token → genera nuevos tokens
4. Nuevas cookies se setean automáticamente
5. Interceptor reintenta el request original
```

---

## Formato de Reporte de Integración

```markdown
# Integration Review — [Funcionalidad]

## Estado General
✅ Compatible / 🟠 Compatible con ajustes / 🔴 Incompatible

## Incompatibilidades Detectadas

### [INCOMP-001] [Descripción]
- **Lado afectado:** Frontend / Backend / Ambos
- **Descripción:** ...
- **Impacto en UX:** ...
- **Corrección Backend:**
  ```typescript
  // Cambio necesario en el backend
  ```
- **Corrección Frontend:**
  ```typescript
  // Cambio necesario en el frontend
  ```

## Flujos Verificados (OK)
- ✅ Login con cookies HttpOnly
- ✅ Refresh token automático
- ...

## Pendientes / Recomendaciones
- [ ] Crear tipos TypeScript compartidos
- [ ] Documentar nuevo endpoint en integration guide
```
