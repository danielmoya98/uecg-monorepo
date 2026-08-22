import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsController } from '../subjects.controller';
import { SubjectsService } from '../subjects.service';
import { EducationLevel } from '../../../prisma/generated/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('SubjectsController', () => {
  let controller: SubjectsController;
  let service: SubjectsService;

  const mockSubjectsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [
        {
          provide: SubjectsService,
          useValue: mockSubjectsService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<SubjectsController>(SubjectsController);
    service = module.get<SubjectsService>(SubjectsService);

    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create (Registrar Materia)', () => {
    it('debe delegar en SubjectsService.create y retornar el registro creado', async () => {
      const dto = {
        name: 'Biología',
        level: EducationLevel.SECUNDARIA,
        area: 'Ciencias Naturales',
      };
      const mockCreated = { id: 'subj-x', ...dto };
      mockSubjectsService.create.mockResolvedValue(mockCreated);

      const result = await controller.create(dto);

      expect(result).toEqual(mockCreated);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll (Obtener Listado)', () => {
    it('debe delegar en SubjectsService.findAll y retornar materias con paginación', async () => {
      const query = { page: 1, limit: 10, search: 'Biología' };
      const mockResponse = {
        data: [{ id: 'subj-x', name: 'Biología', level: 'SECUNDARIA' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockSubjectsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne (Detalle de Materia)', () => {
    it('debe delegar en SubjectsService.findOne y retornar el registro', async () => {
      const mockSubject = {
        id: 'subj-x',
        name: 'Biología',
        level: 'SECUNDARIA',
      };
      mockSubjectsService.findOne.mockResolvedValue(mockSubject);

      const result = await controller.findOne('subj-x');

      expect(result).toEqual(mockSubject);
      expect(service.findOne).toHaveBeenCalledWith('subj-x');
    });
  });

  describe('update (Actualizar Materia)', () => {
    it('debe delegar en SubjectsService.update y retornar el registro modificado', async () => {
      const dto = { name: 'Biología Avanzada' };
      const mockUpdated = {
        id: 'subj-x',
        name: 'Biología Avanzada',
        level: 'SECUNDARIA',
      };
      mockSubjectsService.update.mockResolvedValue(mockUpdated);

      const result = await controller.update('subj-x', dto);

      expect(result).toEqual(mockUpdated);
      expect(service.update).toHaveBeenCalledWith('subj-x', dto);
    });
  });

  describe('remove (Eliminar Materia)', () => {
    it('debe delegar en SubjectsService.remove y retornar el mensaje de éxito', async () => {
      const mockResponse = { message: 'Materia eliminada correctamente' };
      mockSubjectsService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove('subj-x');

      expect(result).toEqual(mockResponse);
      expect(service.remove).toHaveBeenCalledWith('subj-x');
    });
  });
});
