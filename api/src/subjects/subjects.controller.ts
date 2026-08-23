import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';
import { QuerySubjectsDto } from './dto/query-subjects.dto';
import { SubjectEntity } from './entities/subject.entity';

// 🔥 IMPORTACIONES ABAC
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { SystemPermissions } from '../auth/constants/permissions.constant';

@ApiTags('Catálogo de Materias')
@ApiCookieAuth('uecg_access_token')
@UseGuards(AuthGuard('jwt'), PermissionsGuard) // 🔥 Candados Activados
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @RequirePermissions(SystemPermissions.MANAGE_ALL_SUBJECT) // 🔥 ABAC: Solo Administradores autorizados
  @UseInterceptors(IdempotencyInterceptor) // Escudo Anti-rebotes
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra una nueva materia en el catálogo' })
  @ApiCreatedResponse({
    description: 'La materia ha sido registrada exitosamente en el catálogo.',
    type: SubjectEntity,
  })
  @ApiBadRequestResponse({
    description: 'Los datos enviados en el formulario no son válidos.',
  })
  @ApiConflictResponse({
    description:
      'Ya existe una materia con el mismo nombre en este nivel educativo.',
  })
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  // 🔓 Sin @RequirePermissions: Lectura abierta para usuarios logueados (útil para selects en otros módulos)
  @ApiOperation({
    summary:
      'Obtiene el listado de materias (soporta filtro por nivel y búsqueda)',
  })
  @ApiOkResponse({
    description: 'Lista paginada de materias obtenida con éxito.',
  })
  findAll(@Query() query: QuerySubjectsDto) {
    return this.subjectsService.findAll(query);
  }

  @Get(':id')
  // 🔓 Lectura abierta
  @ApiOperation({ summary: 'Obtiene una materia por su ID' })
  @ApiOkResponse({
    description: 'Materia encontrada exitosamente.',
    type: SubjectEntity,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la materia con el ID proporcionado.',
  })
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(SystemPermissions.MANAGE_ALL_SUBJECT) // 🔥 ABAC
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualiza los datos de una materia' })
  @ApiOkResponse({
    description: 'Materia actualizada de manera exitosa en el catálogo.',
    type: SubjectEntity,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la materia a actualizar.',
  })
  @ApiConflictResponse({
    description: 'Ya existe otra materia con ese mismo nombre en este nivel.',
  })
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Patch(':id/status')
  @RequirePermissions(SystemPermissions.MANAGE_ALL_SUBJECT) // 🔥 ABAC
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activa o desactiva una materia en el catálogo institucional',
  })
  @ApiOkResponse({
    description: 'Estado de la materia actualizado exitosamente.',
    type: SubjectEntity,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la materia a modificar.',
  })
  toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive?: boolean,
  ) {
    return this.subjectsService.toggleStatus(id, isActive);
  }

  @Delete(':id')
  @RequirePermissions(SystemPermissions.MANAGE_ALL_SUBJECT) // 🔥 ABAC
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Elimina una materia del catálogo' })
  @ApiOkResponse({
    description: 'Materia eliminada de forma exitosa del catálogo.',
  })
  @ApiNotFoundResponse({ description: 'No se encontró la materia a eliminar.' })
  @ApiConflictResponse({
    description:
      'No se puede eliminar la materia porque se encuentra asignada en la carga horaria.',
  })
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}
