# Prompt: Security Review

> Usar este prompt para realizar una auditoría de seguridad específica sobre un área del backend.

---

## Instrucciones para el Agente

Realiza una auditoría de seguridad del componente especificado. Evalúa cada categoría y reporta vulnerabilidades con su nivel de severidad.

---

## 1. Autenticación JWT

- [ ] ¿El JWT secret es suficientemente largo y aleatorio (mínimo 32 chars, recomendado 64)?
- [ ] ¿El secreto se lee de variable de entorno sin fallback hardcodeado?
- [ ] ¿El access token tiene expiración corta (recomendado: 15 minutos)?
- [ ] ¿El refresh token tiene expiración razonable (máx 30 días)?
- [ ] ¿El refresh token está hasheado (bcrypt) antes de guardarse en DB?
- [ ] ¿Al hacer logout se invalida el refresh token en DB?
- [ ] ¿La estrategia JWT verifica que `payload.sub` existe antes de retornar el usuario?

## 2. Cookies de Sesión

- [ ] ¿Las cookies de auth son `httpOnly: true`?
- [ ] ¿Las cookies son `secure: true` en producción?
- [ ] ¿El `sameSite` es `'none'` en producción (cross-origin) o `'strict'` si mismo dominio?
- [ ] ¿La cookie de access token tiene el mismo tiempo de expiración que el JWT?

## 3. Rate Limiting

- [ ] ¿El endpoint de login tiene rate limit (máx 5-10 req/min)?
- [ ] ¿El endpoint de forgot-password tiene rate limit (máx 3 req/min)?
- [ ] ¿Hay protección contra ataques de enumeración de usuarios?
- [ ] ¿Los errores de "usuario no encontrado" y "contraseña incorrecta" dan el mismo mensaje?

## 4. Control de Acceso (ABAC)

- [ ] ¿Todos los endpoints protegidos tienen `JwtAuthGuard`?
- [ ] ¿Los endpoints con restricciones tienen `PermissionsGuard`?
- [ ] ¿El guard de permisos verifica `req.user.permissions` del JWT (no de DB)?
- [ ] ¿Los endpoints de administración verifican jerarquía (Director no puede crear SUPER_ADMIN)?
- [ ] ¿Los endpoints de lectura verifican ownership cuando aplica?

## 5. Validación de Entrada

- [ ] ¿La ValidationPipe tiene `whitelist: true` y `forbidNonWhitelisted: true` global?
- [ ] ¿Los DTOs validan tipos, formatos y rangos correctamente?
- [ ] ¿Los parámetros de ruta UUID están validados con `ParseUUIDPipe`?
- [ ] ¿Los campos de texto son sanitizados (trim) antes de guardar?

## 6. Exposición de Datos Sensibles

- [ ] ¿Las respuestas excluyen `password`, `hashedRefreshToken`, `fcmTokens`?
- [ ] ¿Los logs no registran contraseñas, tokens o datos personales?
- [ ] ¿Los mensajes de error no revelan información interna del sistema?
- [ ] ¿Los datos PII (CI, teléfono, dirección) están encriptados en DB?

## 7. Dependencias y Configuración

- [ ] ¿`helmet` está habilitado globalmente?
- [ ] ¿CORS está configurado correctamente (origins específicos, no `*`)?
- [ ] ¿Las variables de entorno sensibles no están en `.env` commiteado?
- [ ] ¿`firebase-credentials.json` está en `.gitignore`?
- [ ] ¿Las dependencias tienen versiones fijas (sin `^` en críticas)?

---

## Formato de Reporte de Seguridad

```markdown
# Security Review Report — [Área Analizada]
Fecha: YYYY-MM-DD

## Resumen de Riesgos
| Severidad | Cantidad |
|---|---|
| 🔴 Crítico | X |
| 🟠 Alto | X |
| 🟡 Medio | X |
| 🟢 Bajo | X |

## Hallazgos Críticos

### [CRÍTICO-001] [Título del problema]
- **Ubicación:** archivo.ts:línea
- **Descripción:** Qué problema existe y por qué es peligroso
- **CVSS Score estimado:** X.X
- **Corrección inmediata:**
  ```typescript
  // Código de corrección
  ```

## Hallazgos Altos
...

## Hallazgos Medios
...

## Configuración Verificada (OK)
- ✅ JWT secret desde variable de entorno
- ✅ HttpOnly cookies configuradas
- ...
```
