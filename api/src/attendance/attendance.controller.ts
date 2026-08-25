import {
  Controller,
  Post,
  Patch,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { RegisterAttendanceDto } from './dto/register-attendance.dto';
import { GetMonitorDto } from './dto/get-monitor.dto';
import { ManualAttendanceDto } from './dto/manual-attendance.dto';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { GetClassroomAttendanceDto } from './dto/get-classroom-attendance.dto';
import { JustifyAttendanceDto } from './dto/justify-attendance.dto';
import { CreateJustificationRangeDto } from './dto/create-justification-range.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';

// 🔥 IMPORTACIONES ABAC
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { SystemPermissions } from '../auth/constants/permissions.constant';

@ApiTags('Control de Asistencia')
@ApiCookieAuth('uecg_access_token')
@Controller('attendance')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ==========================================
  // 👨‍🏫 RUTAS DEL DOCENTE
  // ==========================================

  @Get('schedule')
  // 🔥 ABAC: Dejamos entrar al Docente (su horario) y al Admin (todo el colegio)
  @RequirePermissions(
    SystemPermissions.READ_OWN_TIMETABLE,
    SystemPermissions.MANAGE_ALL_ATTENDANCE,
    SystemPermissions.READ_ALL_ATTENDANCE,
  )
  @ApiOperation({ summary: 'Obtiene el horario del día AGRUPADO EN BLOQUES' })
  async getDailySchedule(@Query('date') date: string, @Req() req: any) {
    return this.attendanceService.getDailySchedule(date, req.user);
  }

  @Get('classroom')
  @RequirePermissions(SystemPermissions.CREATE_OWN_ATTENDANCE)
  @ApiOperation({
    summary: 'Obtiene alumnos usando el primer periodo del bloque',
  })
  async getClassroomAttendance(
    @Query() query: GetClassroomAttendanceDto,
    @Req() req: any,
  ) {
    return this.attendanceService.getClassroomAttendance(
      query.classroomId,
      query.classPeriodId,
      query.date,
      req.user,
    );
  }

  @Post('bulk')
  @RequirePermissions(SystemPermissions.CREATE_OWN_ATTENDANCE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Guarda la asistencia masiva en múltiples periodos',
  })
  async saveBulkAttendance(
    @Body() bulkData: BulkAttendanceDto,
    @Req() req: any,
  ) {
    return this.attendanceService.saveBulkAttendance(bulkData, req.user);
  }

  // ==========================================
  // 🛡️ RUTAS COMPARTIDAS (DOCENTE Y DIRECTOR)
  // ==========================================

  @Post('scan')
  // 🔥 ABAC: Dejamos entrar al que toma su lista (Docente) o al que maneja todo (Admin)
  @RequirePermissions(
    SystemPermissions.CREATE_OWN_ATTENDANCE,
    SystemPermissions.MANAGE_ALL_ATTENDANCE,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registra asistencia mediante escaneo QR para un bloque',
  })
  async scanQR(@Body() dto: RegisterAttendanceDto, @Req() req: any) {
    return this.attendanceService.registerScan(dto, req.user);
  }

  @Get('monitor')
  // 🔥 ABAC: Dejamos entrar al Docente (para ver su curso) y al Admin (para ver todos)
  @RequirePermissions(
    SystemPermissions.CREATE_OWN_ATTENDANCE,
    SystemPermissions.READ_ALL_ATTENDANCE,
  )
  @ApiOperation({ summary: 'Monitor en vivo' })
  async getDailyMonitor(@Query() query: GetMonitorDto, @Req() req: any) {
    return this.attendanceService.getDailyMonitor(query, req.user);
  }

  @Post('manual')
  // 🔥 ABAC: Dejamos entrar al Docente (Plan B) y al Admin (Corrección manual)
  @RequirePermissions(
    SystemPermissions.CREATE_OWN_ATTENDANCE,
    SystemPermissions.MANAGE_ALL_ATTENDANCE,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marca o corrige la asistencia manualmente (Plan B)',
  })
  async markManualAttendance(
    @Body() dto: ManualAttendanceDto,
    @Req() req: any,
  ) {
    return this.attendanceService.markManualAttendance(dto, req.user);
  }

  // ==========================================
  // 🏛️ RUTAS EXCLUSIVAS DEL DIRECTOR
  // ==========================================

  @Get('history/:enrollmentId')
  @RequirePermissions(SystemPermissions.READ_ALL_ATTENDANCE)
  @ApiOperation({
    summary: 'Obtiene historial de faltas/atrasos para justificar',
  })
  async getHistory(
    @Param('enrollmentId') enrollmentId: string,
    @Req() req: any,
  ) {
    return this.attendanceService.getStudentAttendanceHistory(
      enrollmentId,
      req.user,
    );
  }

  @Patch('justify/:id')
  @RequirePermissions(SystemPermissions.MANAGE_ALL_ATTENDANCE)
  @ApiOperation({ summary: 'Convierte una falta/atraso en Licencia (EXCUSED)' })
  async justify(
    @Param('id') id: string,
    @Body() dto: JustifyAttendanceDto,
    @Req() req: any,
  ) {
    return this.attendanceService.justifyAttendance(
      id,
      dto.justification,
      req.user,
    );
  }

  @Post('justifications')
  @RequirePermissions(SystemPermissions.MANAGE_ALL_ATTENDANCE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra una licencia/justificación por rango de fechas' })
  async createJustificationRange(
    @Body() dto: CreateJustificationRangeDto,
    @Req() req: any,
  ) {
    return this.attendanceService.createJustificationRange(dto, req.user);
  }

  @Get('justifications/:enrollmentId')
  @RequirePermissions(SystemPermissions.READ_ALL_ATTENDANCE)
  @ApiOperation({ summary: 'Obtiene las licencias/justificaciones de un estudiante' })
  async getStudentJustifications(
    @Param('enrollmentId') enrollmentId: string,
    @Req() req: any,
  ) {
    return this.attendanceService.getStudentJustifications(
      enrollmentId,
      req.user,
    );
  }

  // ==========================================
  // 🗓️ FERIADOS Y DÍAS NO LECTIVOS
  // ==========================================

  @Post('holidays')
  @RequirePermissions(SystemPermissions.MANAGE_ALL_ATTENDANCE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra un feriado o día no lectivo' })
  async createHoliday(@Body() dto: CreateHolidayDto, @Req() req: any) {
    return this.attendanceService.createHoliday(dto, req.user);
  }

  @Get('holidays')
  @RequirePermissions(
    SystemPermissions.READ_ALL_ATTENDANCE,
    SystemPermissions.READ_OWN_TIMETABLE,
  )
  @ApiOperation({ summary: 'Lista feriados y días no lectivos' })
  async getHolidays(@Query('academicYearId') academicYearId?: string) {
    return this.attendanceService.getHolidays(academicYearId);
  }
}
