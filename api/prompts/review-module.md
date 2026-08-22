# Prompt: Review de Módulo Existente

> Usar este prompt para auditar un módulo existente y detectar problemas de arquitectura, deuda técnica y violaciones de convenciones.

---

## Instrucciones para el Agente

Analiza el módulo `[nombre-del-módulo]` y reporta TODOS los problemas encontrados en las siguientes categorías:

### 1. Violaciones Arquitecturales

Verifica contra `.ai/backend-rules.md`:

- [ ] ¿Hay `console.log` en algún archivo del módulo?
- [ ] ¿Algún método usa `user: any` o `dto: any` en la firma?
- [ ] ¿El Controller accede a `PrismaService` directamente?
- [ ] ¿Hay lógica de negocio (queries, cálculos) en el Controller?
- [ ] ¿Se usan secretos hardcodeados o `process.env` directo en el Service?
- [ ] ¿Hay operaciones multi-tabla sin `$transaction`?
- [ ] ¿Se lanza `Error` genérico en lugar de excepciones de NestJS?

### 2. Problemas de Seguridad

Verifica contra `docs/security/auth-flow.md`:

- [ ] ¿Los endpoints protegidos tienen `JwtAuthGuard`?
- [ ] ¿Los endpoints con permisos específicos tienen `PermissionsGuard` + `@RequirePermissions()`?
- [ ] ¿Se verifica ownership ABAC antes de retornar datos del recurso?
- [ ] ¿Las respuestas excluyen campos sensibles (`password`, `hashedRefreshToken`, `fcmTokens`)?
- [ ] ¿Los rate limits están aplicados donde corresponde?

### 3. Calidad de DTOs

Verifica contra `docs/conventions/dto-strategy.md`:

- [ ] ¿Todos los DTOs usan `class-validator`?
- [ ] ¿Todos los campos tienen `@ApiProperty()` para Swagger?
- [ ] ¿Los parámetros UUID usan `ParseUUIDPipe` o `@IsUUID()`?
- [ ] ¿Los Update DTOs extienden `PartialType` del Create DTO?
- [ ] ¿Los campos de fecha usan `@IsDateString()`?

### 4. Performance

- [ ] ¿Hay queries N+1 (query dentro de loop)?
- [ ] ¿Las queries independientes usan `Promise.all`?
- [ ] ¿Se usa `select` para evitar over-fetching?
- [ ] ¿Hay datos costosos que deberían estar en caché Redis?

### 5. Completitud Funcional

- [ ] ¿Falta algún endpoint CRUD esperado?
- [ ] ¿La paginación está implementada en todos los endpoints de lista?
- [ ] ¿Los errores de validación de negocio tienen mensajes claros en español?
- [ ] ¿Hay manejo de `null` cuando el recurso puede no existir?

---

## Formato de Reporte

```markdown
# Reporte de Review — Módulo: [nombre]

## Resumen
- Estado: 🔴 Crítico / 🟠 Con issues / 🟡 Menor / ✅ Correcto
- Problemas encontrados: X
- Acción requerida: [descripción breve]

## Problemas Críticos (Bloquean deploy)
1. [Problema] en [archivo:línea]
   - Descripción: ...
   - Corrección: ...

## Problemas Mayores (Deuda técnica alta)
...

## Problemas Menores (Mejoras)
...

## Lo que está bien
...
```
