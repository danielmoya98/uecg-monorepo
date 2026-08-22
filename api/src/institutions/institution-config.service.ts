import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Institution } from '../../prisma/generated/client';

@Injectable()
export class InstitutionConfigService {
  private cache: Institution | null = null;
  private cacheExpiry = 0;
  private readonly TTL = 5 * 60 * 1000; // 5 minutos

  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<Institution> {
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    const institution = await this.prisma.institution.findFirst();
    if (!institution) {
      throw new NotFoundException(
        'No se encontró la configuración de la Institución.',
      );
    }

    this.cache = institution;
    this.cacheExpiry = Date.now() + this.TTL;
    return institution;
  }

  invalidate() {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}
