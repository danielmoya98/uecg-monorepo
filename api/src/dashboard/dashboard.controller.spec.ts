import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('DashboardController - Pruebas Unitarias', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardService = {
    getRootStats: jest.fn(),
    getGlobalStats: jest.fn(),
    getTeacherStats: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getRootStats', () => {
    it('debe delegar en DashboardService.getRootStats', async () => {
      const expectedData = {
        accounts: 10,
        roles: 2,
        dbSize: '10 MB',
        status: 'ONLINE',
      };
      mockDashboardService.getRootStats.mockResolvedValue(expectedData);

      const result = await controller.getRootStats();

      expect(result).toEqual(expectedData);
      expect(service.getRootStats).toHaveBeenCalled();
    });
  });

  describe('getGlobalStats', () => {
    it('debe delegar en DashboardService.getGlobalStats', async () => {
      const expectedData = {
        students: 100,
        teachers: 10,
        classrooms: 5,
        lastSync: '17/06/2026',
      };
      mockDashboardService.getGlobalStats.mockResolvedValue(expectedData);

      const result = await controller.getGlobalStats();

      expect(result).toEqual(expectedData);
      expect(service.getGlobalStats).toHaveBeenCalled();
    });
  });

  describe('getTeacherStats', () => {
    it('debe delegar en DashboardService.getTeacherStats con el ID del docente autenticado', async () => {
      const expectedData = {
        nextClassTime: '08:00',
        nextSubject: 'Matemáticas',
        nextGroup: '3ro A',
        studentsCount: 40,
        attendanceStatus: 'Al día',
        currentTrimester: '1er Trimestre',
      };
      mockDashboardService.getTeacherStats.mockResolvedValue(expectedData);

      const reqMock = { user: { userId: 'teacher-123' } };
      const result = await controller.getTeacherStats(reqMock);

      expect(result).toEqual(expectedData);
      expect(service.getTeacherStats).toHaveBeenCalledWith('teacher-123');
    });
  });
});
