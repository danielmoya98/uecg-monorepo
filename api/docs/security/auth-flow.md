# Flujo de Autenticación y Autorización — UECG

## Resumen del Sistema

El sistema usa **JWT stateless** con doble token (access + refresh), almacenados en **HttpOnly Cookies**. La autorización usa un sistema **ABAC (Attribute-Based Access Control)** con permisos granulares del tipo `action:scope:Subject`.

---

## 1. Flujo de Login

```
POST /api/v1/auth/login
  Body: { email, password }

  1. Normalizar email (trim + lowercase)
  2. Buscar usuario en DB → include role.permissions
  3. Verificar UserStatus !== 'INACTIVE' → ForbiddenException
  4. Verificar lockoutUntil > now → ForbiddenException con tiempo restante
  5. bcrypt.compare(password, user.password)
  6. Si falla: incrementar failedLoginAttempts, lockout si >= 5
  7. Si pasa: resetear failedLoginAttempts = 0, lastLoginAt = now
  8. Si requiresPasswordChange = true → retornar { status: 'SETUP_REQUIRED', setupToken }
  9. Construir lista de permisos: `${action}:${subject}`[]
  10. Generar accessToken (15m) + refreshToken (7d)
  11. Guardar hashedRefreshToken en DB (bcrypt)
  12. Emitir evento 'auth.login.success'
  13. SET cookie uecg_access_token (httpOnly, 15m)
  14. SET cookie uecg_refresh_token (httpOnly, 7d)
  15. Retornar { status: 'SUCCESS', user: { id, fullName, email, role, permissions } }
```

---

## 2. Flujo de Setup Password (Primer Login)

```
POST /api/v1/auth/setup-password
  Body: { setupToken: string, newPassword: string }

  1. Verificar setupToken (tipo 'setup_password', 15m expiración)
  2. Extraer userId del payload
  3. Hash nueva contraseña con bcrypt (10 rounds)
  4. Actualizar password + requiresPasswordChange = false en DB
  5. Generar tokens nuevos → SET cookies
  6. Retornar { status: 'SUCCESS', user: { ... }, access_token, refresh_token }
```

---

## 3. Flujo de Refresh Token

```
POST /api/v1/auth/refresh
  Cookie: uecg_refresh_token

  1. Extraer refresh token de la cookie
  2. jwtService.verifyAsync(refreshToken) → decoded payload
  3. Buscar usuario en DB → include role.permissions
  4. Verificar user.hashedRefreshToken existe
  5. bcrypt.compare(refreshToken, user.hashedRefreshToken)
  6. Si válido: generar nuevos tokens → actualizar hashedRefreshToken en DB
  7. SET nuevas cookies (access 15m + refresh 7d)
  8. Emitir evento 'auth.refresh.success'
```

---

## 4. Flujo de Recuperación de Contraseña

```
POST /api/v1/auth/forgot-password (Throttled: 3/min)
  Body: { identifier: string }  // CI o email

  1. Buscar usuario por email o ci
  2. Generar código OTP de 6 dígitos, expiración 15 min
  3. Enviar email con código vía MailService (Nodemailer)
  4. Guardar OTP hasheado en DB

POST /api/v1/auth/reset-password (Throttled: 5/min)
  Body: { identifier, code, newPassword }

  1. Buscar usuario por identifier
  2. Verificar código OTP (no expirado, bcrypt compare)
  3. Hash nueva contraseña
  4. Actualizar password + invalidar OTP en DB
  5. Retornar éxito
```

---

## 5. JWT Payload Structure

```typescript
// Access Token Payload (15 minutos)
{
  sub: string,         // user.id (UUID)
  email: string,       // user.email
  roleName: string,    // role.name (ej. 'DIRECTOR')
  permissions: string[], // ['read:all:Student', 'manage:all:Timetable', ...]
  iat: number,
  exp: number
}

// req.user después de JWT validation
{
  userId: string,      // payload.sub
  email: string,
  role: string,        // payload.roleName
  permissions: string[]
}
```

---

## 6. Extracción del Token

La estrategia JWT acepta el token de **dos fuentes** (en orden de prioridad):

```typescript
ExtractJwt.fromExtractors([
  ExtractJwt.fromAuthHeaderAsBearerToken(), // 1. Authorization: Bearer <token>
  (req) => req?.cookies?.['uecg_access_token'] || null, // 2. Cookie HttpOnly
])
```

Esto soporta tanto el frontend web (cookies) como clientes API/móvil (Bearer header).

---

## 7. Guards de Seguridad

### `JwtAuthGuard` (Autenticación)
```typescript
// Extendido de passport-jwt
// Verifica firma y expiración del JWT
// Llena req.user con el payload del token
```

### `PermissionsGuard` (Autorización ABAC)
```typescript
// Lee @RequirePermissions() del endpoint
// Compara contra req.user.permissions
// Bypass automático si el usuario tiene 'manage:all:all'
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@RequirePermissions(SystemPermissions.READ_ALL_STUDENT)
```

### `ThrottlerGuard` (Rate Limiting)
```typescript
// Login: 5 intentos / 60 segundos
// ForgotPassword: 3 intentos / 60 segundos
// ResetPassword: 5 intentos / 60 segundos
// Global: 300 requests / 60 segundos
```

---

## 8. Sistema de Permisos ABAC

### Formato de Permiso
```
{action}:{scope}:{Subject}

action  = manage | read | write | create | update | delete
scope   = all | own | any
Subject = Student | Enrollment | Attendance | Grade | User | Role | ...
```

### Enum `SystemPermissions`
```typescript
SystemPermissions.MANAGE_ALL          = 'manage:all:all'         // ROOT
SystemPermissions.READ_ALL_STUDENT    = 'read:all:Student'
SystemPermissions.READ_OWN_STUDENT    = 'read:own:Student'
SystemPermissions.CREATE_OWN_ATTENDANCE = 'create:own:Attendance'
SystemPermissions.UPDATE_OWN_GRADE    = 'update:own:Grade'
// ... ver permissions.constant.ts para lista completa
```

### Matriz de Roles por Defecto

| Permiso | SUPER_ADMIN | DIRECTOR | DOCENTE | PADRE |
|---|:---:|:---:|:---:|:---:|
| `manage:all:all` | ✅ | — | — | — |
| `read:all:Student` | ✅ | ✅ | — | — |
| `read:own:Student` | ✅ | ✅ | ✅ | — |
| `write:any:Enrollment` | ✅ | ✅ | — | — |
| `create:own:Attendance` | ✅ | ✅ | ✅ | — |
| `read:all:Grade` | ✅ | ✅ | — | — |
| `update:own:Grade` | ✅ | ✅ | ✅ | — |
| `manage:all:User` | ✅ | — | — | — |
| `read:own:Guardian` | — | — | — | ✅ |

---

## 9. Cookies de Sesión

```
Cookie: uecg_access_token
  HttpOnly: true
  Secure: true (solo en producción)
  SameSite: 'none' (prod) / 'lax' (dev)
  MaxAge: 15 * 60 * 1000  // 15 minutos

Cookie: uecg_refresh_token
  HttpOnly: true
  Secure: true (solo en producción)
  SameSite: 'none' (prod) / 'lax' (dev)
  MaxAge: 7 * 24 * 60 * 60 * 1000  // 7 días
```

---

## 10. Seguridad de Cuenta

- **Lockout automático:** 5 intentos fallidos → cuenta bloqueada por 15 minutos
- **Estado INACTIVE:** Administrador puede deshabilitar cuentas manualmente
- **Password temporal:** `requiresPasswordChange = true` fuerza cambio en primer login
- **Refresh token rotado:** En cada refresh, se genera nuevo par de tokens
- **Refresh token hasheado:** Solo el hash se guarda en DB (bcrypt), no el token en texto plano

---

## 11. Guía de Integración Frontend

```typescript
// 1. Login
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  credentials: 'include',  // CRÍTICO: envía y recibe cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// 2. Llamadas autenticadas
const data = await fetch('/api/v1/students', {
  credentials: 'include',  // Envía la cookie automáticamente
});

// 3. Refresh silencioso (interceptor axios)
axios.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401) {
    await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
    return axios(error.config);  // Reintentar request original
  }
});

// 4. Logout
await fetch('/api/v1/auth/logout', {
  method: 'POST',
  credentials: 'include',
});
```
