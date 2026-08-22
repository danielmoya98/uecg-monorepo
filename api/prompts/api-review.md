# Prompt: API Review

> Usar este prompt para auditar los contratos de API de un módulo y verificar que cumplen los estándares del proyecto.

---

## Instrucciones para el Agente

Analiza los endpoints del módulo `[nombre-del-módulo]` y verifica que cumplan los estándares de API definidos en `.ai/api-rules.md`.

---

## Checklist de API Review

### Contratos HTTP

- [ ] ¿Los métodos HTTP son semánticamente correctos? (GET=lectura, POST=crear, PATCH=actualizar parcial, DELETE=eliminar)
- [ ] ¿Los `@HttpCode()` están correctos? (POST crear → 201, resto → 200)
- [ ] ¿Las URLs son kebab-case y en plural?
- [ ] ¿Los parámetros de filtro son query strings (no path params)?

### Documentación Swagger

- [ ] ¿El Controller tiene `@ApiTags('Nombre Legible')`?
- [ ] ¿Cada endpoint tiene `@ApiOperation({ summary: '...' })`?
- [ ] ¿Hay `@ApiResponse()` para los códigos esperados (200/201, 401, 403, 404, 409)?
- [ ] ¿Los DTOs tienen `@ApiProperty()` en todos los campos?
- [ ] ¿Los endpoints de file upload tienen `@ApiConsumes('multipart/form-data')` y `@ApiBody`?

### Paginación

- [ ] ¿Todos los endpoints GET de lista aceptan `PaginationDto`?
- [ ] ¿Las respuestas paginadas incluyen `meta: { page, limit, total, totalPages }`?
- [ ] ¿El límite máximo está controlado (máx 100 por página)?

### Validación de Entrada

- [ ] ¿Los parámetros de ruta UUID usan `ParseUUIDPipe`?
- [ ] ¿Los Body DTOs tienen validaciones completas con `class-validator`?
- [ ] ¿Los Query DTOs transforman tipos correctamente (`@Type(() => Number)` para números)?

### Respuestas

- [ ] ¿Las respuestas de éxito son manejadas por `ResponseInterceptor`?
- [ ] ¿Los errores lanzan excepciones semánticas de NestJS (no strings genéricos)?
- [ ] ¿Los mensajes de error están en español?
- [ ] ¿Los campos sensibles están excluidos de las respuestas?

---

## Formato de Reporte de API

```markdown
# API Review — Módulo: [nombre]

## Endpoints Analizados

| Método | URL | Estado | Issues |
|---|---|---|---|
| GET | /resource | ✅ | — |
| POST | /resource | 🟠 | Sin @ApiResponse(404) |
| PATCH | /resource/:id | 🔴 | Expone campo `password` |

## Issues Detallados

### Issue 1: [Descripción]
- **Endpoint:** METHOD /path
- **Problema:** Descripción del problema
- **Severidad:** Alto / Medio / Bajo
- **Corrección:**
  ```typescript
  // Código corregido
  ```

## Contratos Verificados (OK)
- ✅ Paginación implementada en GET /resource
- ✅ Rate limiting en endpoints sensibles
```

---

## Preguntas Adicionales para el Agente

1. ¿Qué endpoints del módulo están documentados en `docs/modules/inventory.md`? ¿Están desactualizados?
2. ¿El contrato de este módulo es compatible con el frontend descrito en `docs/integration/frontend-integration.md`?
3. ¿Hay endpoints que el frontend necesitaría pero que aún no existen?
