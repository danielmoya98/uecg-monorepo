import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { QuerySubjectsDto } from './dto/query-subjects.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSubjectDto) {
    const trimmedName = data.name.trim();

    // Validar duplicados exactos case-insensitive en el mismo nivel
    const existing = await this.prisma.subject.findFirst({
      where: {
        name: { equals: trimmedName, mode: 'insensitive' },
        level: data.level,
      },
    });

    if (existing) {
      throw new ConflictException(
        `La materia '${trimmedName}' ya existe en el nivel ${data.level}.`,
      );
    }

    try {
      return await this.prisma.subject.create({
        data: {
          name: trimmedName,
          code: data.code?.trim() || null,
          level: data.level,
          area: data.area?.trim() || null,
          requiresSpecialSpace:
            data.requiresSpecialSpace !== undefined
              ? data.requiresSpecialSpace
              : false,
          allowedSpaceType: data.allowedSpaceType || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          `Ya existe una materia con el nombre '${trimmedName}' en el nivel ${data.level}.`,
        );
      }
      throw error;
    }
  }

  async findAll(query: QuerySubjectsDto) {
    const isAll = query.all === true;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search?.trim() || '';
    const level = query.level;
    const isActive = query.isActive;

    const whereCondition: any = {
      ...(level && { level }),
      ...(typeof isActive === 'boolean' && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { area: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    if (isAll) {
      const data = await this.prisma.subject.findMany({
        where: whereCondition,
        orderBy: [{ level: 'asc' }, { area: 'asc' }, { name: 'asc' }],
      });

      return {
        data,
        meta: {
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
        },
      };
    }

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.subject.count({ where: whereCondition }),
      this.prisma.subject.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: [{ level: 'asc' }, { area: 'asc' }, { name: 'asc' }],
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      throw new NotFoundException('Materia no encontrada en el catálogo.');
    }
    return subject;
  }

  async update(id: string, data: UpdateSubjectDto) {
    const current = await this.findOne(id); // Validamos existencia

    const targetName =
      data.name !== undefined ? data.name.trim() : current.name;
    const targetLevel = data.level !== undefined ? data.level : current.level;

    if (data.name !== undefined || data.level !== undefined) {
      const existing = await this.prisma.subject.findFirst({
        where: {
          name: { equals: targetName, mode: 'insensitive' },
          level: targetLevel,
          id: { not: id }, // Excluimos la materia actual
        },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe otra materia con el nombre '${targetName}' en el nivel ${targetLevel}.`,
        );
      }
    }

    try {
      return await this.prisma.subject.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name.trim() }),
          ...(data.code !== undefined && {
            code: data.code?.trim() || null,
          }),
          ...(data.level !== undefined && { level: data.level }),
          ...(data.area !== undefined && {
            area: data.area?.trim() || null,
          }),
          ...(data.requiresSpecialSpace !== undefined && {
            requiresSpecialSpace: data.requiresSpecialSpace,
          }),
          ...(data.allowedSpaceType !== undefined && {
            allowedSpaceType: data.allowedSpaceType,
          }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          `Ya existe otra materia con el nombre '${targetName}' en el nivel ${targetLevel}.`,
        );
      }
      throw error;
    }
  }

  async toggleStatus(id: string, isActive?: boolean) {
    const current = await this.findOne(id);
    const newStatus =
      typeof isActive === 'boolean' ? isActive : !current.isActive;

    return this.prisma.subject.update({
      where: { id },
      data: { isActive: newStatus },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // 🔥 REGLA DE INTEGRIDAD: Validar que la materia no esté asignada en carga horaria
    const assignmentsCount = await this.prisma.teacherAssignment.count({
      where: { subjectId: id },
    });

    if (assignmentsCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la materia porque ya se encuentra asignada a uno o más docentes en la carga horaria. Puedes desactivarla para ocultarla de nuevas asignaciones.',
      );
    }

    try {
      await this.prisma.subject.delete({ where: { id } });
      return { message: 'Materia eliminada correctamente del catálogo.' };
    } catch (error: any) {
      if (error?.code === 'P2003') {
        throw new ConflictException(
          'No se puede eliminar la materia debido a dependencias en otros registros del sistema.',
        );
      }
      throw new InternalServerErrorException(
        'Error inesperado al eliminar la materia.',
      );
    }
  }
}

