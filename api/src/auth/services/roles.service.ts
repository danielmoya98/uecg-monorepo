import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);
  private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    const cacheKey = 'roles:catalog:all';
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (err) {
      this.logger.warn(`Error al leer caché de roles: ${err}`);
    }

    const roles = await this.prisma.role.findMany({
      include: {
        _count: { select: { users: true } },
        permissions: { include: { permission: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    try {
      await this.cacheManager.set(cacheKey, roles, this.CACHE_TTL_MS);
    } catch (err) {
      this.logger.warn(`Error al guardar en caché de roles: ${err}`);
    }

    return roles;
  }

  async getRolePermissionsCached(roleId: string): Promise<string[]> {
    const cacheKey = `role:permissions:${roleId}`;
    try {
      const cached = await this.cacheManager.get<string[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (err) {
      this.logger.warn(`Error al consultar caché de permisos del rol ${roleId}: ${err}`);
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      return [];
    }

    const permissions = role.permissions.map(
      (rp) => `${rp.permission.action}:${rp.permission.subject}`,
    );

    try {
      await this.cacheManager.set(cacheKey, permissions, this.CACHE_TTL_MS);
    } catch (err) {
      this.logger.warn(`Error al guardar en caché permisos del rol ${roleId}: ${err}`);
    }

    return permissions;
  }

  async getPermissionsCatalog() {
    const cacheKey = 'permissions:catalog:all';
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (err) {
      this.logger.warn(`Error al leer catálogo de permisos en caché: ${err}`);
    }

    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ subject: 'asc' }, { action: 'asc' }],
    });

    try {
      await this.cacheManager.set(cacheKey, permissions, this.CACHE_TTL_MS);
    } catch (err) {
      this.logger.warn(`Error al guardar catálogo de permisos en caché: ${err}`);
    }

    return permissions;
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });

      const newPermissions = permissionIds.map((pId) => ({
        roleId,
        permissionId: pId,
      }));

      await tx.rolePermission.createMany({ data: newPermissions });

      return { message: 'Permisos del rol actualizados correctamente' };
    });

    // Invalidar cachés
    await this.invalidateRoleCaches(roleId);

    return result;
  }

  async createRole(data: { name: string; description?: string }) {
    const safeName = data.name.trim().toUpperCase().replace(/ /g, '_');

    const existingRole = await this.prisma.role.findUnique({
      where: { name: safeName },
    });

    if (existingRole) {
      throw new ConflictException('Ya existe una política con este nombre');
    }

    const role = await this.prisma.role.create({
      data: {
        name: safeName,
        description: data.description,
      },
    });

    await this.invalidateRoleCaches();

    return role;
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) throw new NotFoundException('Rol no encontrado');

    const protectedRoles = [
      'SUPER_ADMIN',
      'DIRECTOR',
      'DOCENTE',
      'PADRE',
      'ESTUDIANTE',
    ];
    if (protectedRoles.includes(role.name)) {
      throw new BadRequestException(
        'No puedes eliminar un rol fundacional del sistema',
      );
    }

    if (role._count.users > 0) {
      throw new BadRequestException(
        `Este rol tiene ${role._count.users} usuarios asignados. Reasígnalos antes de eliminarlo.`,
      );
    }

    await this.prisma.role.delete({ where: { id } });

    await this.invalidateRoleCaches(id);

    return { message: 'Política de acceso eliminada del sistema' };
  }

  private async invalidateRoleCaches(roleId?: string) {
    try {
      await this.cacheManager.del('roles:catalog:all');
      await this.cacheManager.del('permissions:catalog:all');
      if (roleId) {
        await this.cacheManager.del(`role:permissions:${roleId}`);
      }
    } catch (err) {
      this.logger.warn(`Error al invalidar caché de roles: ${err}`);
    }
  }

  async seedMasterPermissions() {
    await this.prisma.permission.deleteMany({});

    const permissionsData = [
      {
        action: 'manage:all',
        subject: 'all',
        description: 'Acceso absoluto al sistema (ROOT)',
      },
      {
        action: 'read:all',
        subject: 'Dashboard',
        description: 'Ver el panel de estadísticas globales',
      },
      {
        action: 'read:own',
        subject: 'Dashboard',
        description: 'Ver el panel operativo personal',
      },
      {
        action: 'read:all',
        subject: 'Student',
        description: 'Ver directorio completo de estudiantes',
      },
      {
        action: 'read:own',
        subject: 'Student',
        description: 'Ver únicamente a sus estudiantes asignados',
      },
      {
        action: 'update:all',
        subject: 'Student',
        description: 'Modificar/Aprobar datos (RUDE) de cualquier estudiante',
      },
      {
        action: 'read:all',
        subject: 'Enrollment',
        description: 'Ver el historial de inscripciones global',
      },
      {
        action: 'read:own',
        subject: 'Enrollment',
        description: 'Ver únicamente las inscripciones de sus cursos asignados',
      },
      {
        action: 'write:any',
        subject: 'Enrollment',
        description: 'Inscribir, editar y dar de baja estudiantes',
      },
      {
        action: 'read:all',
        subject: 'Attendance',
        description: 'Ver control de asistencia de todo el colegio',
      },
      {
        action: 'create:own',
        subject: 'Attendance',
        description: 'Tomar asistencia de sus clases asignadas',
      },
      {
        action: 'read:all',
        subject: 'Grade',
        description: 'Ver sábanas de notas de cualquier curso',
      },
      {
        action: 'update:own',
        subject: 'Grade',
        description: 'Calificar únicamente sus materias asignadas',
      },
      {
        action: 'manage:all',
        subject: 'Timetable',
        description: 'Armar y editar horarios escolares generales',
      },
      {
        action: 'read:own',
        subject: 'Timetable',
        description: 'Ver únicamente su propio horario',
      },
      {
        action: 'create:any',
        subject: 'Identity',
        description: 'Generar y revocar Carnets Digitales QR',
      },
      {
        action: 'manage:all',
        subject: 'Classroom',
        description: 'Crear y configurar Cursos y Paralelos',
      },
      {
        action: 'manage:all',
        subject: 'Subject',
        description: 'Gestionar catálogo de Materias',
      },
      {
        action: 'manage:all',
        subject: 'TeacherAssignment',
        description: 'Asignar carga horaria a los docentes',
      },
      {
        action: 'manage:all',
        subject: 'PhysicalSpace',
        description: 'Gestionar aulas, laboratorios y canchas',
      },
      {
        action: 'manage:all',
        subject: 'User',
        description: 'Gestionar cuentas de personal',
      },
      {
        action: 'manage:all',
        subject: 'Role',
        description: 'Crear nuevos roles y asignar permisos',
      },
      {
        action: 'manage:all',
        subject: 'Institution',
        description: 'Configurar RUE, logo y datos del colegio',
      },
      {
        action: 'read:all',
        subject: 'Audit',
        description: 'Ver logs y trazabilidad de los usuarios',
      },
      {
        action: 'manage:all',
        subject: 'AcademicYear',
        description: 'Gestionar años académicos y trimestres',
      },
    ];

    await this.prisma.permission.createMany({ data: permissionsData });
    const allPermissions = await this.prisma.permission.findMany();

    const superAdmin = await this.prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' },
    });
    const director = await this.prisma.role.findUnique({
      where: { name: 'DIRECTOR' },
    });
    const docente = await this.prisma.role.findUnique({
      where: { name: 'DOCENTE' },
    });

    if (superAdmin) {
      const rootPerm = allPermissions.find(
        (p) => p.action === 'manage:all' && p.subject === 'all',
      );
      if (rootPerm)
        await this.prisma.rolePermission.create({
          data: { roleId: superAdmin.id, permissionId: rootPerm.id },
        });
    }

    if (director) {
      const directorSubjectsToExclude = [
        'all',
        'User',
        'Role',
        'Institution',
        'Audit',
      ];
      const directorPerms = allPermissions.filter(
        (p) =>
          !directorSubjectsToExclude.includes(p.subject) &&
          !p.action.includes('own'),
      );
      await this.prisma.rolePermission.createMany({
        data: directorPerms.map((perm) => ({
          roleId: director.id,
          permissionId: perm.id,
        })),
        skipDuplicates: true,
      });
    }

    if (docente) {
      const docentePerms = allPermissions.filter(
        (p) =>
          p.action.includes('own') ||
          (p.action === 'read:own' && p.subject === 'Dashboard'),
      );
      await this.prisma.rolePermission.createMany({
        data: docentePerms.map((perm) => ({
          roleId: docente.id,
          permissionId: perm.id,
        })),
        skipDuplicates: true,
      });
    }

    await this.invalidateRoleCaches();

    return { message: 'Estándar Oficial ABAC implementado exitosamente.' };
  }
}
