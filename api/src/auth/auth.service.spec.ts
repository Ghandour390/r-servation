import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';
import { EmailVerificationService } from '../redis/email-verification.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let emailVerificationService: EmailVerificationService;

  const mockUser = {
    id: '1',
    email: 'test@test.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.PARTICIPANT,
    isEmailVerified: true,
  };

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockEmailVerificationService = {
    sendVerificationCode: jest.fn(),
    verifyCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailVerificationService, useValue: mockEmailVerificationService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
    emailVerificationService = module.get<EmailVerificationService>(EmailVerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const mockCompare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;
      mockCompare.mockResolvedValue(true);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.login('test@test.com', 'password');
      expect(result.access_token).toBe('token');
    });

    it('should throw error for invalid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });
});