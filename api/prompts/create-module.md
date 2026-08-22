# Prompt: Crear Nuevo Módulo NestJS

> Usar este prompt cuando se necesite crear un nuevo módulo de dominio en el backend UECG.

---

## Instrucciones para el Agente

Antes de generar código, responde las siguientes preguntas:

1. **¿El modelo Prisma ya existe en el schema?** Si no, describir qué campos necesita.
2. **¿Qué permisos ABAC aplican?** (Ver `src/auth/constants/permissions.constant.ts`)
3. **¿Hay relaciones con otros módulos?** (Importar servicios o depender de otros módulos)
4. **¿Necesita BullMQ processor?** (Operaciones asíncronas pesadas)
5. **¿Necesita EventEmitter listener?** (Reaccionar a eventos de dominio)
6. **¿Necesita WebSocket gateway?** (Notificaciones en tiempo real)

---

## Template de Módulo Completo

### 1. `[name].module.ts`

```typescript
import { Module } from '@nestjs/common';
import { [Name]Controller } from './[name].controller';
import { [Name]Service } from './[name].service';

@Module({
  imports: [
    // BullModule.registerQueue({ name: '[name]-queue' }),  // Si necesita cola
  ],
  controllers: [[Name]Controller],
  providers: [[Name]Service],
  exports: [[Name]Service],  // Si otros módulos necesitan inyectarlo
})
export class [Name]Module {}
```

### 2. `dto/create-[name].dto.ts`

```typescript
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class Create[Name]Dto {
  @ApiProperty({ description: 'Descripción del campo', example: 'valor-ejemplo' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  requiredField: string;

  @ApiPropertyOptional({ description: 'Campo opcional' })
  @IsOptional()
  @IsString()
  optionalField?: string;
}
```

### 3. `dto/update-[name].dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { Create[Name]Dto } from './create-[name].dto';

export class Update[Name]Dto extends PartialType(Create[Name]Dto) {}
```

### 4. `[name].service.ts`

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Create[Name]Dto } from './dto/create-[name].dto';
import { Update[Name]Dto } from './dto/update-[name].dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SystemPermissions } from '../auth/constants/permissions.constant';

// ⚠️ REEMPLAZAR ESTE TIPO CON EL REAL cuando esté disponible en common/types
interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

@Injectable()
export class [Name]Service {
  private readonly logger = new Logger([Name]Service.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // HELPERS PRIVADOS
  // ==========================================

  private verifyAccess(resource: any, user: AuthenticatedUser) {
    const isPowerUser =
      user.permissions.includes(SystemPermissions.MANAGE_ALL) ||
      user.permissions.includes(SystemPermissions.READ_ALL_[RESOURCE]);

    if (isPowerUser) return;

    if (resource.ownerId !== user.userId) {
      throw new ForbiddenException('Sin acceso a este recurso');
    }
  }

  // ==========================================
  // MÉTODOS PÚBLICOS
  // ==========================================

  async findAll(query: PaginationDto, user: AuthenticatedUser) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const whereCondition: any = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [total, data] = await Promise.all([
      this.prisma.[model].count({ where: whereCondition }),
      this.prisma.[model].findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          // ... campos necesarios
          createdAt: true,
        },
      }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const resource = await this.prisma.[model].findUnique({
      where: { id },
      select: { id: true /* ... */ },
    });
    if (!resource) throw new NotFoundException(`[Name] ${id} no encontrado`);
    this.verifyAccess(resource, user);
    return resource;
  }

  async create(dto: Create[Name]Dto, user: AuthenticatedUser) {
    // Verificar duplicados si aplica
    const existing = await this.prisma.[model].findFirst({
      where: { name: dto.requiredField },
    });
    if (existing) throw new ConflictException('[Name] ya existe');

    const resource = await this.prisma.[model].create({
      data: { ...dto },
    });

    this.logger.log(`[Name] creado: ${resource.id} por ${user.email}`);
    return resource;
  }

  async update(id: string, dto: Update[Name]Dto, user: AuthenticatedUser) {
    const resource = await this.prisma.[model].findUnique({ where: { id } });
    if (!resource) throw new NotFoundException(`[Name] ${id} no encontrado`);

    this.verifyAccess(resource, user);

    return this.prisma.[model].update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string, user: AuthenticatedUser) {
    const resource = await this.prisma.[model].findUnique({ where: { id } });
    if (!resource) throw new NotFoundException(`[Name] ${id} no encontrado`);

    this.verifyAccess(resource, user);

    // Soft delete preferido sobre delete físico
    await this.prisma.[model].update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    return { message: '[Name] desactivado exitosamente' };
  }
}
```

### 5. `[name].controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { [Name]Service } from './[name].service';
import { Create[Name]Dto } from './dto/create-[name].dto';
import { Update[Name]Dto } from './dto/update-[name].dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { SystemPermissions } from '../auth/constants/permissions.constant';
// import { CurrentUser } from '../common/decorators/current-user.decorator'; // Cuando exista

@ApiTags('[Name en Español]')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('[name]')
export class [Name]Controller {
  constructor(private readonly [name]Service: [Name]Service) {}

  @Get()
  @RequirePermissions(SystemPermissions.READ_ALL_[RESOURCE])
  @ApiOperation({ summary: 'Obtener lista de [name]' })
  @ApiResponse({ status: 200, description: 'Lista retornada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  findAll(
    @Query() query: PaginationDto,
    @Req() req: any, // Reemplazar con @CurrentUser() cuando exista el decorator
  ) {
    return this.[name]Service.findAll(query, req.user);
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.READ_ALL_[RESOURCE])
  @ApiOperation({ summary: 'Obtener [name] por ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.[name]Service.findOne(id, req.user);
  }

  @Post()
  @RequirePermissions(SystemPermissions.MANAGE_ALL_[RESOURCE])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo [name]' })
  @ApiResponse({ status: 201, description: '[Name] creado' })
  @ApiResponse({ status: 409, description: 'Ya existe' })
  create(
    @Body() dto: Create[Name]Dto,
    @Req() req: any,
  ) {
    return this.[name]Service.create(dto, req.user);
  }

  @Patch(':id')
  @RequirePermissions(SystemPermissions.MANAGE_ALL_[RESOURCE])
  @ApiOperation({ summary: 'Actualizar [name]' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Update[Name]Dto,
    @Req() req: any,
  ) {
    return this.[name]Service.update(id, dto, req.user);
  }

  @Delete(':id')
  @RequirePermissions(SystemPermissions.MANAGE_ALL_[RESOURCE])
  @ApiOperation({ summary: 'Desactivar [name]' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.[name]Service.remove(id, req.user);
  }
}
```

---

## Checklist Post-Creación

- [ ] Agregar `[Name]Module` a los imports de `app.module.ts`
- [ ] Agregar el permiso `MANAGE_ALL_[RESOURCE]` al enum `SystemPermissions`
- [ ] Agregar el permiso al catálogo en `roles.service.ts` → `seedMasterPermissions()`
- [ ] Asignar el permiso a los roles correctos en `seedMasterPermissions()`
- [ ] Documentar en `docs/modules/inventory.md`
- [ ] Actualizar `PROJECT_STATE.md`
- [ ] Crear modelo en `prisma/schema/schema.prisma` si no existe
- [ ] Ejecutar `npx prisma migrate dev --name create_[name]_model`
