import { Test } from '@nestjs/testing';
import { EventRepository } from './event.repository';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus } from '@prisma/client';

describe('EventRepository', () => {
  let repository: EventRepository;
  let prisma: PrismaService;

  const mockEvent = {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    dateTime: new Date(),
    location: 'Test Location',
    maxCapacity: 100,
    remainingPlaces: 100,
    status: 'DRAFT' as EventStatus,
    managerId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    event: {
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
        EventRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<EventRepository>(EventRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create event', async () => {
    mockPrisma.event.create.mockResolvedValue(mockEvent);
    const result = await repository.create(mockEvent);
    expect(result).toEqual(mockEvent);
  });

  it('should find event by id', async () => {
    mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
    const result = await repository.findById('1');
    expect(result).toEqual(mockEvent);
  });

  it('should update remaining places', async () => {
    mockPrisma.event.update.mockResolvedValue({ ...mockEvent, remainingPlaces: 99 });
    const result = await repository.updateRemainingPlaces('1', 99);
    expect(result.remainingPlaces).toBe(99);
  });
});