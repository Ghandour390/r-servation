import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prisma: PrismaService;

  const mockUser = {
    id: '1',
    email: 'test@test.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.PARTICIPANT,
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create user', async () => {
    mockPrisma.user.create.mockResolvedValue(mockUser);
    const result = await repository.create(mockUser);
    expect(result).toEqual(mockUser);
  });

  it('should find user by id', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    const result = await repository.findById('1');
    expect(result).toEqual(mockUser);
  });

  it('should find user by email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    const result = await repository.findByEmail('test@test.com');
    expect(result).toEqual(mockUser);
  });
});