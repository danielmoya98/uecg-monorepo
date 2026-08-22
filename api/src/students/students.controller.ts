import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { CreateFullRudeDto } from './dto/create-student.dto';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { ImportStudentsDto } from './dto/import-students.dto';
import { RegisterFcmTokenDto } from '../auth/dto/register-fcm-token.dto';

// 🔥 IMPORTACIONES ABAC
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { SystemPermissions } from '../auth/constants/permissions.constant';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Inscripciones y RUDE')
@ApiCookieAuth('uecg_access_token')
@Controller('students')
@UseGuards(AuthGuard('jwt'), PermissionsGuard) // 🔥 Escudo Activado
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register-rude')
  @RequirePermissions(SystemPermissions.WRITE_ANY_ENROLLMENT) // 🔥 ABAC: Solo personal con permisos de matriculación
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Registra a un estudiante, sus tutores y su RUDE en una sola transacción',
  })
  createFullRude(@Body() createDto: CreateFullRudeDto) {
    return this.studentsService.registerFullRude(createDto);
  }

  @Post('import-excel/:academicYearId')
  @RequirePermissions(SystemPermissions.WRITE_ANY_ENROLLMENT) // 🔥 ABAC: Solo personal con permisos de matriculación
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Importa estudiantes masivamente a un curso específico',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        status: { type: 'string', description: 'INSCRITO o REVISION_SIE' },
        classroomId: { type: 'string', description: 'UUID del curso destino' },
      },
    },
  })
  importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Param('academicYearId') academicYearId: string,
    @Body() dto: ImportStudentsDto,
  ) {
    return this.studentsService.importStudentsFromExcel(
      file,
      academicYearId,
      dto.status,
      dto.classroomId,
    );
  }

  // 🔥 RUTA DE APP MÓVIL:
  @Patch('fcm-token')
  @RequirePermissions(SystemPermissions.READ_OWN_GUARDIAN) // 🔥 ABAC: Exclusivo para padres logueados
  @ApiOperation({
    summary: 'Registra el dispositivo móvil para notificaciones Push',
  })
  async updateFcmToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterFcmTokenDto,
  ) {
    const userId = user.userId;

    const dbUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) return { status: 'ERROR', message: 'Usuario no encontrado' };

    // Usamos Set para no guardar tokens duplicados si el padre desinstala e instala la app
    const tokens = new Set<string>(dbUser.fcmTokens || []);
    tokens.add(dto.fcmToken);

    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmTokens: Array.from(tokens) },
    });

    return {
      status: 'SUCCESS',
      message: 'Dispositivo vinculado correctamente',
    };
  }
}
