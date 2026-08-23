import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from '../../auth.controller';
import { AuthService } from '../../auth.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    refreshTokens: jest.fn(),
    setupNewPassword: jest.fn(),
    logout: jest.fn(),
    registerGuardian: jest.fn(),
    registerStudent: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPasswordWithCode: jest.fn(),
    registerFcmToken: jest.fn(),
    getUserSessions: jest.fn(),
    revokeSession: jest.fn(),
    revokeAllOtherSessions: jest.fn(),
  };

  const mockResponse = () => {
    const res: any = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('debe establecer cookies y retornar payload híbrido con tokens para mobile', async () => {
      const res = mockResponse();
      const req: any = { headers: { 'user-agent': 'Mozilla/5.0' }, socket: { remoteAddress: '127.0.0.1' } };
      mockAuthService.login.mockResolvedValue({
        status: 'SUCCESS',
        user: { id: 'u1', email: 'admin@uecg.edu.bo', role: 'SUPER_ADMIN' },
        tokens: { accessToken: 'acc-123', refreshToken: 'ref-123' },
      });

      const result = await controller.login(
        { email: 'admin@uecg.edu.bo', password: 'password123' },
        res,
        req,
      );

      expect(res.cookie).toHaveBeenCalledWith('uecg_access_token', 'acc-123', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('uecg_refresh_token', 'ref-123', expect.any(Object));
      expect(result).toEqual({
        status: 'SUCCESS',
        user: { id: 'u1', email: 'admin@uecg.edu.bo', role: 'SUPER_ADMIN' },
        accessToken: 'acc-123',
        refreshToken: 'ref-123',
        access_token: 'acc-123',
      });
    });
  });

  describe('refreshToken', () => {
    it('debe aceptar refresh token desde cookies y retornar nuevos tokens', async () => {
      const res = mockResponse();
      const req: any = { cookies: { uecg_refresh_token: 'valid-cookie-refresh' }, headers: {}, socket: {} };

      mockAuthService.refreshTokens.mockResolvedValue({
        status: 'SUCCESS',
        tokens: { accessToken: 'new-acc', refreshToken: 'new-ref' },
      });

      const result = await controller.refreshToken(req, res);

      expect(res.cookie).toHaveBeenCalledWith('uecg_access_token', 'new-acc', expect.any(Object));
      expect(result).toEqual({
        status: 'SUCCESS',
        message: 'Sesión renovada exitosamente',
        accessToken: 'new-acc',
        refreshToken: 'new-ref',
        access_token: 'new-acc',
      });
    });

    it('debe lanzar UnauthorizedException si no se envía ningún refresh token', async () => {
      const res = mockResponse();
      const req: any = { cookies: {}, headers: {}, socket: {} };

      await expect(controller.refreshToken(req, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('debe invocar a AuthService.logout y limpiar las cookies', async () => {
      const res = mockResponse();
      const req: any = { cookies: { uecg_refresh_token: 'token-logout' }, headers: {} };
      const user: any = { userId: 'u1', email: 'admin@uecg.edu.bo', role: 'SUPER_ADMIN', permissions: [] };
      mockAuthService.logout.mockResolvedValue({ status: 'SUCCESS', message: 'Sesión cerrada exitosamente' });

      const result = await controller.logout(user, req, res);

      expect(authService.logout).toHaveBeenCalledWith('u1', 'token-logout');
      expect(res.clearCookie).toHaveBeenCalledWith('uecg_access_token', expect.any(Object));
      expect(res.clearCookie).toHaveBeenCalledWith('uecg_refresh_token', expect.any(Object));
      expect(result.status).toBe('SUCCESS');
    });
  });

  describe('sessions', () => {
    it('debe listar sesiones activas del usuario', async () => {
      const user: any = { userId: 'u1' };
      const req: any = { cookies: { uecg_refresh_token: 'active-refresh' }, headers: {} };
      mockAuthService.getUserSessions.mockResolvedValue([
        { id: 'sess-1', deviceType: 'WEB', isCurrent: true },
      ]);

      const result = await controller.getSessions(user, req);

      expect(result.status).toBe('SUCCESS');
      expect(result.sessions).toHaveLength(1);
    });

    it('debe revocar una sesión por ID', async () => {
      const user: any = { userId: 'u1' };
      mockAuthService.revokeSession.mockResolvedValue({
        status: 'SUCCESS',
        message: 'Sesión revocada exitosamente',
      });

      const result = await controller.revokeSession(user, 'sess-remote');

      expect(mockAuthService.revokeSession).toHaveBeenCalledWith('u1', 'sess-remote');
      expect(result.status).toBe('SUCCESS');
    });
  });

  describe('getMe', () => {
    it('debe retornar los datos del usuario autenticado', async () => {
      const user: any = {
        userId: 'u1',
        email: 'docente@uecg.edu.bo',
        role: 'DOCENTE',
        permissions: ['read:own:Student'],
      };

      const result = await controller.getMe(user);

      expect(result).toEqual({
        status: 'SUCCESS',
        user: {
          id: 'u1',
          email: 'docente@uecg.edu.bo',
          role: 'DOCENTE',
          permissions: ['read:own:Student'],
        },
      });
    });
  });
});
