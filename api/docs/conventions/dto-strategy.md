# Estrategia de DTOs y Validación

## Principios Fundamentales

1. **Todo dato entrante debe pasar por un DTO** — Sin excepciones
2. **`whitelist: true`** — Propiedades no declaradas en el DTO son eliminadas automáticamente
3. **`forbidNonWhitelisted: true`** — Propiedades extra generan error 400
4. **`transform: true`** — Los valores se convierten al tipo TypeScript declarado
5. **`@ApiProperty()`** en todos los campos — Swagger siempre al día

## Configuración Global (main.ts)

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,             // Elimina propiedades desconocidas
    forbidNonWhitelisted: true,  // Rechaza requests con propiedades extra
    transform: true,             // Convierte strings a tipos (number, boolean, etc.)
  }),
);
```

## Jerarquía de DTOs

### Create DTO
Para crear un recurso nuevo. Todos los campos requeridos son `@IsNotEmpty()`.
```typescript
export class CreateSubjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: EducationLevel })
  @IsEnum(EducationLevel)
  level: EducationLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  area?: string;
}
```

### Update DTO
Extiende de `PartialType(CreateDto)` — todos los campos opcionales.
```typescript
import { PartialType } from '@nestjs/mapped-types';

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}
```

### Query DTO
Para filtros y paginación en endpoints `GET`.
```typescript
export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
```

### Upsert DTO
Para operaciones create-or-update. Ejemplo en grades:
```typescript
export class UpsertGradeDto {
  @ApiProperty()
  @IsUUID()
  enrollmentId: string;

  @ApiProperty()
  @IsUUID()
  teacherAssignmentId: string;

  @ApiProperty()
  @IsUUID()
  trimesterId: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(25)
  scoreSer?: number;
  // ...
}
```

## Validaciones de Arrays Anidados

Para DTOs con objetos anidados (como el RUDE):
```typescript
@ValidateNested({ each: true })  // Validar cada elemento del array
@Type(() => GuardianDto)          // OBLIGATORIO para class-transformer
@IsArray()
@ArrayMinSize(1)
guardians: GuardianDto[];

@ValidateNested()                 // Para objeto único anidado
@Type(() => RudeDataDto)
@IsOptional()
rudeData?: RudeDataDto;
```

## Validaciones de Parámetros de Ruta

```typescript
// ✅ Correcto — Parámetros UUID siempre validados
@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) { ... }

// O con DTO explícito
class UuidParamDto {
  @IsUUID()
  id: string;
}
```

## Campos Comunes y sus Validadores

| Tipo de Campo | Decoradores |
|---|---|
| UUID | `@IsUUID()` `@IsNotEmpty()` |
| Email | `@IsEmail()` `@Transform(({ value }) => value?.toLowerCase().trim())` |
| Fecha ISO | `@IsDateString()` |
| Enum | `@IsEnum(MyEnum)` |
| Número entero | `@IsInt()` `@Min(0)` `@Max(100)` |
| Número decimal | `@IsNumber()` `@Min(0)` |
| String no vacío | `@IsString()` `@IsNotEmpty()` |
| String con trim | `@IsString()` `@Transform(({ value }) => value?.trim())` |
| Boolean | `@IsBoolean()` |
| Array de strings | `@IsArray()` `@IsString({ each: true })` |
| Campo opcional | `@IsOptional()` (siempre primero) |

## Respuesta de Error de Validación

Cuando la validación falla, NestJS retorna automáticamente:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "academicYearId must be a UUID"
  }
}
```

> Nota: Con `forbidNonWhitelisted: true`, si el cliente envía propiedades no declaradas, el error es:
> `"property unknownField should not exist"`

## Anti-Patrones Prohibidos

```typescript
// ❌ PROHIBIDO — Validar manualmente en el controller
if (!body.id || typeof body.id !== 'string') throw new BadRequestException(...)

// ❌ PROHIBIDO — Aceptar body sin tipado
async create(@Body() body: any) { ... }

// ❌ PROHIBIDO — Saltar la ValidationPipe en una ruta
@UsePipes(new ValidationPipe({ transform: false })) // Sobrescribir la config global

// ✅ CORRECTO — Siempre usar DTOs tipados
async create(@Body() dto: CreateResourceDto) { ... }
```
