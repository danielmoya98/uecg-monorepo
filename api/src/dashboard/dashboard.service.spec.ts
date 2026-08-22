import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('DashboardService - Pruebas Unitarias', () => {
  let service: DashboardService;

  const mockPrisma = {
    user: {
      count: jest.fn(),
    },
    role: {
      count: jest.fn(),
    },
    enrollment: {
      count: jest.fn(),
    },
    classroom: {
      count: jest.fn(),
    },
    institution: {
      findFirst: jest.fn(),
    },
    scheduleSlot: {
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    trimester: {
      findFirst: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe('getRootStats', () => {
    it('debe devolver datos en caché si existen', async () => {
      const cachedData = {
        accounts: 10,
        roles: 2,
        dbSize: '10 MB',
        status: 'ONLINE',
      };
      mockCacheManager.get.mockResolvedValue(cachedData);

      const result = await service.getRootStats();

      expect(result).toEqual(cachedData);
      expect(mockCacheManager.get).toHaveBeenCalledWith('dashboard:root');
      expect(mockPrisma.user.count).not.toHaveBeenCalled();
    });

    it('debe realizar consultas a base de datos e invalidar / guardar en caché si no existe caché', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrisma.user.count.mockResolvedValue(100);
      mockPrisma.role.count.mockResolvedValue(4);
      mockPrisma.$queryRaw.mockResolvedValue([{ size: '45 MB' }]);

      const result = await service.getRootStats();

      expect(result).toEqual({
        accounts: 100,
        roles: 4,
        dbSize: '45 MB',
        status: 'ONLINE',
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'dashboard:root',
        expect.any(Object),
        60 * 15,
      );
    });
  });

  describe('getGlobalStats', () => {
    it('debe devolver datos en caché si existen', async () => {
      const cachedData = {
        students: 100,
        teachers: 10,
        classrooms: 5,
        lastSync: '17/06/2026',
      };
      mockCacheManager.get.mockResolvedValue(cachedData);

      const result = await service.getGlobalStats();

      expect(result).toEqual(cachedData);
      expect(mockPrisma.enrollment.count).not.toHaveBeenCalled();
    });

    it('debe realizar consultas y guardar en caché si no hay caché', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrisma.enrollment.count.mockResolvedValue(500);
      mockPrisma.classroom.count.mockResolvedValue(20);
      mockPrisma.user.count.mockResolvedValue(30);
      mockPrisma.institution.findFirst.mockResolvedValue({
        updatedAt: new Date('2026-06-17'),
      });

      const result = await service.getGlobalStats();

      expect(result).toEqual({
        students: 500,
        teachers: 30,
        classrooms: 20,
        lastSync: new Date('2026-06-17').toLocaleDateString('es-BO'),
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'dashboard:global',
        expect.any(Object),
        60 * 5,
      );
    });
  });

  describe('invalidateDashboardCaches', () => {
    it('debe borrar las claves de caché root y global', async () => {
      await service.invalidateDashboardCaches();

      expect(mockCacheManager.del).toHaveBeenCalledWith('dashboard:root');
      expect(mockCacheManager.del).toHaveBeenCalledWith('dashboard:global');
    });
  });
});
