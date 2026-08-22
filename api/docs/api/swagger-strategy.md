# Estrategia Swagger / OpenAPI

## Configuración Global (main.ts)

```typescript
const config = new DocumentBuilder()
  .setTitle('UECG Core API')
  .setDescription('Motor de datos estandarizado para el Sistema RUE/SIE')
  .setVersion('1.0.0')
  .addCookieAuth('uecg_access_token')  // Auth via cookie en Swagger UI
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document, {
  customSiteTitle: 'UECG API Docs',
});
```

**URL:** `http://localhost:4000/api/docs`

---

## Decoradores Obligatorios por Capa

### Controller (nivel de clase)
```typescript
@ApiTags('Nombre del Módulo')              // OBLIGATORIO — Agrupa endpoints en Swagger
@ApiBearerAuth() // O @ApiCookieAuth()     // OBLIGATORIO si requiere autenticación
@Controller('resource')
export class ResourceController {}
```

### Endpoint (nivel de método)
```typescript
@ApiOperation({ summary: 'Descripción concisa' })      // OBLIGATORIO
@ApiResponse({ status: 200, description: 'OK' })       // Respuestas documentadas
@ApiResponse({ status: 401, description: 'No auth' })
@ApiResponse({ status: 403, description: 'Sin perms' })
@Get(':id')
findOne(@Param('id') id: string) {}
```

### Parámetros especiales
```typescript
// Query params
@ApiQuery({ name: 'search', required: false, type: String })

// Path params
@ApiParam({ name: 'id', type: 'string', format: 'uuid' })

// File upload
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: { type: 'string', format: 'binary' }
    }
  }
})
```

### DTOs
```typescript
export class CreateUserDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@uecg.edu.bo'
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Especialidad del docente',
    example: 'Matemáticas'
  })
  @IsOptional()
  @IsString()
  specialty?: string;
}
```

---

## Tags Actuales del Sistema

| Tag | Módulo | Descripción |
|---|---|---|
| `Autenticación` | auth | Login, logout, tokens, recovery |
| `Usuarios` | users | Gestión de cuentas de personal |
| `Instituciones` | institutions | Datos RUE/SIE |
| `Gestiones Académicas` | academic-years | Años lectivos |
| `Cursos y Aulas` | classrooms | Paralelos por gestión |
| `Materias` | subjects | Catálogo de asignaturas |
| `Carga Horaria` | teacher-assignments | Docente ↔ Materia ↔ Curso |
| `Periodos de Clase` | class-periods | Horarios fijos del colegio |
| `Horarios` | timetables | Casillas de horario |
| `Inscripciones y RUDE` | students | Registro de estudiantes |
| `Gestión de Inscripciones` | enrollments | FSM de estados |
| `Tutores` | guardians | Padres y apoderados |
| `Trimestres` | trimesters | Apertura y cierre de períodos |
| `Asistencia` | attendance | Control multi-método |
| `Calificaciones` | grades | Sistema Ley 070 |
| `Identidad Digital` | identity | Carnets QR |
| `Dashboard` | dashboard | Estadísticas en tiempo real |
| `Auditoría` | audit | Trazabilidad de acciones |
| `Reportes` | reports | Generación PDF asíncrona |
| `Espacios Físicos` | physical-spaces | Aulas, laboratorios |

---

## Tipos de Respuesta Documentados

Para evitar repetición, crear response types reutilizables:

```typescript
// src/common/swagger/responses.ts

import { ApiResponseOptions } from '@nestjs/swagger';

export const SwaggerResponses = {
  UNAUTHORIZED: {
    status: 401,
    description: 'Token JWT inválido o expirado',
    schema: {
      example: {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Token inválido' }
      }
    }
  } as ApiResponseOptions,
  
  FORBIDDEN: {
    status: 403,
    description: 'Sin permisos para esta acción',
    schema: {
      example: {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Privilegios insuficientes' }
      }
    }
  } as ApiResponseOptions,
  
  NOT_FOUND: {
    status: 404,
    description: 'Recurso no encontrado',
    schema: {
      example: {
        success: false,
        error: { code: 'NOT_FOUND', message: 'El registro no existe' }
      }
    }
  } as ApiResponseOptions,
};
```
