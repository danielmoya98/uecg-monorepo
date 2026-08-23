import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePhysicalSpaceDto } from './dto/create-physical-space.dto';
import { UpdatePhysicalSpaceDto } from './dto/update-physical-space.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SpaceType } from '../../prisma/generated/client';

@Injectable()
export class PhysicalSpacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPhysicalSpaceDto: CreatePhysicalSpaceDto) {
    // Verificamos que no exista un aula con exactamente el mismo nombre
    const existingSpace = await this.prisma.physicalSpace.findFirst({
      where: {
        name: {
          equals: createPhysicalSpaceDto.name,
          mode: 'insensitive', // Ignora mayúsculas/minúsculas
        },
      },
    });

    if (existingSpace) {
      throw new ConflictException(
        `Ya existe un espacio físico registrado con el nombre "${createPhysicalSpaceDto.name}"`,
      );
    }

    return this.prisma.physicalSpace.create({
      data: createPhysicalSpaceDto,
    });
  }

  async findAll(type?: SpaceType, isActive?: boolean, search?: string) {
    // Permite filtrar por tipo, estado o realizar una búsqueda textual por nombre
    return this.prisma.physicalSpace.findMany({
      where: {
        ...(type && { type }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
      orderBy: [
        { type: 'asc' }, // Primero agrupa por tipo
        { name: 'asc' }, // Luego ordena alfabéticamente
      ],
    });
  }

  async findOne(id: string) {
    const space = await this.prisma.physicalSpace.findUnique({
      where: { id },
    });

    if (!space) {
      throw new NotFoundException(`El espacio físico con ID ${id} no existe`);
    }

    return space;
  }

  async update(id: string, updatePhysicalSpaceDto: UpdatePhysicalSpaceDto) {
    // Primero comprobamos que exista
    await this.findOne(id);

    // Si intenta cambiar el nombre, verificamos que el nuevo nombre no esté en uso por otra aula
    if (updatePhysicalSpaceDto.name) {
      const existingName = await this.prisma.physicalSpace.findFirst({
        where: {
          name: { equals: updatePhysicalSpaceDto.name, mode: 'insensitive' },
          id: { not: id }, // Excluimos el aula actual de la búsqueda
        },
      });

      if (existingName) {
        throw new ConflictException(
          `Ya existe OTRO espacio físico llamado "${updatePhysicalSpaceDto.name}"`,
        );
      }
    }

    // 🛡️ REGLA DE SEGURIDAD: Si se intenta desactivar el espacio, verificar que no tenga usos activos
    if (updatePhysicalSpaceDto.isActive === false) {
      const activeSchedules = await this.prisma.scheduleSlot.count({
        where: { physicalSpaceId: id },
      });
      const activeBaseRooms = await this.prisma.classroom.count({
        where: { baseRoomId: id },
      });

      if (activeSchedules > 0 || activeBaseRooms > 0) {
        throw new ConflictException(
          `No se puede desactivar este espacio físico porque actualmente está asignado a ${activeBaseRooms} curso(s) y ${activeSchedules} periodo(s) de horario. Reasigne esas materias/aulas antes de desactivarlo.`,
        );
      }
    }

    return this.prisma.physicalSpace.update({
      where: { id },
      data: updatePhysicalSpaceDto,
    });
  }

  async remove(id: string) {
    // Verificamos que el espacio exista
    await this.findOne(id);

    // 🛡️ REGLA DE SEGURIDAD: ¿Este espacio físico se está usando en algún horario?
    const isUsedInSchedule = await this.prisma.scheduleSlot.findFirst({
      where: { physicalSpaceId: id },
    });

    // 🛡️ REGLA DE SEGURIDAD: ¿Es el aula base de algún curso?
    const isBaseRoom = await this.prisma.classroom.findFirst({
      where: { baseRoomId: id },
    });

    if (isUsedInSchedule || isBaseRoom) {
      throw new ConflictException(
        'No se puede eliminar este espacio físico porque actualmente está asignado a un curso o a un horario de clases. Primero reasigne esas materias a otra aula.',
      );
    }

    return this.prisma.physicalSpace.delete({
      where: { id },
    });
  }
}
