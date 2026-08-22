# Seguridad de Datos — Encriptación y PII

## Datos Sensibles en el Sistema

El sistema maneja datos de menores de edad y personal educativo. Se aplican las siguientes protecciones:

---

## Encriptación de PII (Personally Identifiable Information)

### Datos encriptados en DB (AES-256 vía `EncryptionService`)

Los siguientes campos del modelo `User` son encriptados antes de guardarse:
- `ci` — Carnet de Identidad
- `phone` — Teléfono
- `address` — Dirección

El `EncryptionService` en `src/common/services/encryption.service.ts` provee:
- `encrypt(value: string)`: AES encryption
- `decrypt(value: string | null | undefined)`: AES decryption
- `generateBlindIndex(value: string)`: Para búsquedas sobre datos encriptados

**Blind Index:** El campo `ciHash` almacena un hash determinístico del CI para permitir búsquedas sin desencriptar.

### Flujo correcto
```typescript
// Al GUARDAR
updateData.ci = this.encryptionService.encrypt(data.ci);
updateData.ciHash = this.encryptionService.generateBlindIndex(data.ci);

// Al LEER (siempre desencriptar antes de retornar)
return {
  ...user,
  ci: this.encryptionService.decrypt(user.ci),
  phone: this.encryptionService.decrypt(user.phone),
  address: this.encryptionService.decrypt(user.address),
};

// Al BUSCAR
const user = await this.prisma.user.findFirst({
  where: { ciHash: this.encryptionService.generateBlindIndex(searchCI) }
});
```

---

## Seguridad de Contraseñas

### Hash con bcrypt
```typescript
const salt = await bcrypt.genSalt(10);  // 10 rounds — balance seguridad/performance
const hashedPassword = await bcrypt.hash(plainPassword, salt);
```

### Verificación
```typescript
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
```

### Reglas de contraseñas
- Mínimo 8 caracteres (validado en DTO)
- Hash bcrypt antes de guardar en DB
- NUNCA guardar en texto plano
- NUNCA loguear contraseñas

---

## Seguridad de Refresh Tokens

El refresh token también se hashea con bcrypt:
```typescript
const hashedRefreshToken = await this.hashPassword(refreshToken);
await this.prisma.user.update({
  where: { id: userId },
  data: { hashedRefreshToken },
});
```

Al validar:
```typescript
const isValid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
```

---

## Datos de Estudiantes (Menores de Edad)

Los datos RUDE son altamente sensibles y están sujetos a regulación boliviana:
- Datos de salud (`hasDisability`, `disabilityType`, etc.)
- Datos socioeconómicos (servicios básicos, trabajo)
- Datos familiares (tutores, con quién vive)

**Restricciones de acceso:**
- RUDE solo visible para DIRECTOR y SECRETARIA (permiso `write:any:Enrollment`)
- Los DOCENTES ven solo la lista de alumnos, no datos RUDE
- Los PADRES solo ven los datos de sus propios hijos

---

## Headers de Seguridad

Configurados por `helmet` en `main.ts`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (en HTTPS)
- `Content-Security-Policy`
- `X-XSS-Protection`

---

## Variables de Entorno Críticas

Estas variables deben ser tratadas como secretos en producción:

```
JWT_SECRET          → Min 64 chars aleatorios
ENCRYPTION_KEY      → Clave AES-256 (32 bytes)
DATABASE_URL        → Incluye credenciales de DB
REDIS_PASSWORD      → Contraseña de Redis
SMTP_PASS           → Contraseña del email
```

**Reglas:**
- Nunca en `.env` commiteado (usar `.env.template` sin valores)
- Usar secrets management del proveedor cloud en producción
- Rotar periódicamente (mínimo: una vez al año)

---

## firebase-credentials.json

Este archivo contiene credenciales de Firebase Admin SDK.
- DEBE estar en `.gitignore` ✅
- NO compartir este archivo — genera uno nuevo para cada entorno
- En producción: cargar vía variable de entorno `GOOGLE_APPLICATION_CREDENTIALS`
