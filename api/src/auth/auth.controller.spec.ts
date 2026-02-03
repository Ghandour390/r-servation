import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            verifyEmail: jest.fn(),
            resendVerificationCode: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = { email: 'test@test.com', password: 'Pass123!', firstName: 'John', lastName: 'Doe', role: 'PARTICIPANT' };
      const result = { user: { id: 1, email: 'test@test.com' }, message: 'Utilisateur créé. Veuillez vérifier votre email.' };
      jest.spyOn(authService, 'register').mockResolvedValue(result as any);

      expect(await controller.register(dto)).toBe(result);
      expect(authService.register).toHaveBeenCalledWith('test@test.com', 'Pass123!', 'John', 'Doe', 'PARTICIPANT');
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const dto = { email: 'test@test.com', password: 'Pass123!' };
      const result = { user: { id: 1, email: 'test@test.com' }, access_token: 'token' };
      jest.spyOn(authService, 'login').mockResolvedValue(result as any);

      expect(await controller.login(dto)).toBe(result);
      expect(authService.login).toHaveBeenCalledWith('test@test.com', 'Pass123!');
    });
  });

  describe('forgotPassword', () => {
    it('should send verification code', async () => {
      const result = { message: 'Code de réinitialisation envoyé' };
      jest.spyOn(authService, 'forgotPassword').mockResolvedValue(result);

      expect(await controller.forgotPassword({ email: 'test@test.com' })).toBe(result);
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@test.com');
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const dto = { email: 'test@test.com', code: '123456', newPassword: 'NewPass123!' };
      const result = { message: 'Mot de passe réinitialisé avec succès' };
      jest.spyOn(authService, 'resetPassword').mockResolvedValue(result);

      expect(await controller.resetPassword(dto)).toBe(result);
      expect(authService.resetPassword).toHaveBeenCalledWith('test@test.com', '123456', 'NewPass123!');
    });
  });

  describe('verifyEmail', () => {
    it('should verify code', async () => {
      const dto = { email: 'test@test.com', code: '123456' };
      const result = { message: 'Email vérifié avec succès' };
      jest.spyOn(authService, 'verifyEmail').mockResolvedValue(result);

      expect(await controller.verifyEmail(dto)).toBe(result);
      expect(authService.verifyEmail).toHaveBeenCalledWith('test@test.com', '123456');
    });
  });

  describe('resendVerification', () => {
    it('should resend verification code', async () => {
      const result = { message: 'Code de vérification renvoyé' };
      jest.spyOn(authService, 'resendVerificationCode').mockResolvedValue(result);

      expect(await controller.resendVerification('test@test.com')).toBe(result);
      expect(authService.resendVerificationCode).toHaveBeenCalledWith('test@test.com');
    });
  });
});
