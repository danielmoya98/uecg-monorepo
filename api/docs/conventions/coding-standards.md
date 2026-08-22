# Convenciones de Código — Backend UECG

> Reglas de estilo, naming y estructura que TODO el código del proyecto debe seguir.

---

## 1. Nomenclatura General

### Archivos
- **Módulos:** `[name].module.ts` — `academic-years.module.ts`
- **Controllers:** `[name].controller.ts` — `attendance.controller.ts`
- **Services:** `[name].service.ts` — `grades.service.ts`
- **DTOs:** `[action]-[resource].dto.ts` — `create-enrollment.dto.ts`, `upsert-grade.dto.ts`
- **Guards:** `[name].guard.ts` — `permissions.guard.ts`
- **Interceptors:** `[name].interceptor.ts` — `response.interceptor.ts`
- **Listeners:** `[name].listener.ts` — `attendance.listener.ts`
- **Processors:** `[name].processor.ts` — `reports.processor.ts`
- **Interfaces:** `[name].interface.ts` — dentro de carpeta `interfaces/`

### Variables y Funciones
- **camelCase** para variables y funciones: `findEnrollmentById`, `hashedRefreshToken`
- **PascalCase** para clases: `AttendanceService`, `PermissionsGuard`
- **SCREAMING_SNAKE_CASE** para constantes: `MAX_LOGIN_ATTEMPTS`, `PERMISSIONS_KEY`
- **kebab-case** para nombres de carpetas: `academic-years/`, `teacher-assignments/`

### Rutas HTTP
- Kebab-case: `/api/v1/academic-years`, `/api/v1/teacher-assignments`
- Plurales en recursos principales: `/students`, `/classrooms`
- Acciones específicas como sub-ruta: `/students/register-rude`, `/auth/setup-password`

---

## 2. Estructura de Módulo Estándar

Cada feature module DEBE tener la siguiente estructura mínima:

```
src/[feature]/
├── [feature].module.ts      # OBLIGATORIO
├── [feature].controller.ts  # OBLIGATORIO si tiene endpoints HTTP
├── [feature].service.ts     # OBLIGATORIO si tiene lógica de negocio
└── dto/                     # OBLIGATORIO si recibe datos del cliente
    ├── create-[feature].dto.ts
    ├── update-[feature].dto.ts
    └── [query]-[feature].dto.ts
```

Opcionales según necesidad:
```
├── [feature].listener.ts    # Si consume eventos de dominio
├── [feature].processor.ts   # Si procesa jobs de BullMQ
├── [feature].gateway.ts     # Si usa WebSockets
├── [feature].cron.ts        # Si tiene tareas programadas
├── interfaces/              # Tipos/interfaces de respuesta
└── entities/                # Si expone entidades al exterior
```

---

## 3. Estructura de Controller

```typescript
@ApiTags('Nombre Legible del Módulo')          // OBLIGATORIO
@Controller('resource-name')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)  // Guards en el nivel de clase preferiblemente
export class ResourceController {
  constructor(private readonly service: ResourceService) {}

  @Get()
  @RequirePermissions(SystemPermissions.READ_ALL_RESOURCE)
  @ApiOperation({ summary: 'Descripción breve del endpoint' })
  @ApiResponse({ status: 200, description: 'Lista de recursos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationDto) {
    return this.service.findAll(query, user);
  }
}
```

**Reglas de Controller:**
- El controller NUNCA contiene lógica de negocio
- El controller NUNCA consulta Prisma directamente
- El controller NUNCA hace cálculos complejos
- El controller SOLO recibe DTOs validados y delega al service
- Usar `@CurrentUser()` en lugar de `@Req() req: any`

---

## 4. Estructura de Service

```typescript
@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name);

  constructor(
    private readonly prisma: PrismaService,
    // Otros servicios inyectados aquí
  ) {}

  // Métodos públicos primero
  async findAll(query: PaginationDto, user: AuthenticatedUser) { ... }
  async findOne(id: string, user: AuthenticatedUser) { ... }
  async create(dto: CreateResourceDto, user: AuthenticatedUser) { ... }
  async update(id: string, dto: UpdateResourceDto, user: AuthenticatedUser) { ... }
  async remove(id: string, user: AuthenticatedUser) { ... }

  // Helpers privados al final
  private validateAccess(resource: any, user: AuthenticatedUser) { ... }
  private buildWhereCondition(query: PaginationDto) { ... }
}
```

**Reglas de Service:**
- Los servicios SIEMPRE reciben el usuario autenticado como último parámetro
- La validación ABAC va dentro del service, no en el controller
- Transacciones ACID para operaciones multi-tabla
- Lanzar excepciones semánticas: `NotFoundException`, `ConflictException`, `ForbiddenException`

---

## 5. DTOs y Validaciones

### Reglas de DTO
- Usar `class-validator` para todas las validaciones
- Usar `class-transformer` para transformaciones (fecha, número, etc.)
- Decorar con `@ApiProperty()` para Swagger
- Todos los campos opcionales deben ser `@IsOptional()` primero

```typescript
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateClassroomDto {
  @ApiProperty({ description: 'ID del año académico' })
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ enum: EducationLevel })
  @IsEnum(EducationLevel)
  level: EducationLevel;

  @ApiProperty({ example: 'Primero' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  grade: string;

  @ApiPropertyOptional({ description: 'Capacidad máxima del aula' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  capacity?: number;
}
```

### Validaciones Obligatorias en Rutas
- Parámetros `:id` → `@IsUUID()` + `@IsNotEmpty()`
- Emails → `@IsEmail()`
- Fechas → `@IsDateString()`
- Arrays → `@IsArray()` + `@ArrayMinSize(1)` si requerido
- Enums → `@IsEnum(MyEnum)`

---

## 6. Formato de Respuesta

### Éxito (manejado por `ResponseInterceptor`)
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Éxito con Paginación
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error (manejado por `AllExceptionsFilter`)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "El registro solicitado no existe en la base de datos."
  }
}
```

**Regla:** Los services NUNCA devuelven `{ success: boolean }` directamente. Deben retornar el dato, o lanzar una excepción. El interceptor y el filtro manejan el formato.

---

## 7. Logging

```typescript
// ✅ Correcto — Usar Logger de NestJS
private readonly logger = new Logger(MyService.name);

this.logger.log('Mensaje informativo');
this.logger.warn('Advertencia no crítica');
this.logger.error('Error crítico', error.stack);
this.logger.debug('Solo en desarrollo');

// ❌ PROHIBIDO — console.log en cualquier lugar
console.log('debug:', data);
```

---

## 8. Variables de Entorno

- Acceder SIEMPRE via `ConfigService`, NUNCA via `process.env` directamente en servicios
- Definir valores por defecto solo en `development`, nunca en `production`

```typescript
// ✅ Correcto
constructor(private configService: ConfigService) {}
const secret = this.configService.get<string>('JWT_SECRET');
if (!secret) throw new Error('JWT_SECRET no configurado');

// ❌ Incorrecto
const secret = process.env.JWT_SECRET || 'hardcoded_secret';
```

---

## 9. Manejo de Errores

```typescript
// Usar excepciones semánticas de NestJS
throw new NotFoundException('Usuario no encontrado');
throw new ConflictException('El email ya está registrado');
throw new ForbiddenException('Sin permisos para esta acción');
throw new BadRequestException('Datos inválidos');
throw new UnauthorizedException('Sesión inválida');

// Para errores internos inesperados
throw new InternalServerErrorException('Error procesando la solicitud');
```

**NUNCA** lanzar `Error` genérico. Usar siempre `HttpException` o sus subclases.

---

## 10. Transacciones Prisma

```typescript
// Para operaciones multi-tabla — SIEMPRE usar $transaction
return await this.prisma.$transaction(async (tx) => {
  const enrollment = await tx.enrollment.create({ data: { ... } });
  await tx.rudeRecord.create({ data: { enrollmentId: enrollment.id, ... } });
  return enrollment;
});

// Para operaciones batch independientes — Promise.all dentro de $transaction
await this.prisma.$transaction(
  records.map((r) => this.prisma.attendanceRecord.upsert({ ... }))
);
```
