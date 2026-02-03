import { Test } from '@nestjs/testing';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventStatus } from '@prisma/client';

describe('EventService', () => {
  let service: EventService;
  let repository: EventRepository;

  const mockEvent = {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    dateTime: new Date(),
    location: 'Test Location',
    maxCapacity: 100,
    remainingPlaces: 100,
    status: 'DRAFT' as EventStatus,
    managerId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: EventRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    repository = module.get<EventRepository>(EventRepository);
  });

  it('should create event', async () => {
    mockRepository.create.mockResolvedValue(mockEvent);
    const result = await service.create({
      title: 'Test Event',
      description: 'Test Description',
      dateTime: new Date(),
      location: 'Test Location',
      maxCapacity: 100,
      managerId: 'user1',
    });
    expect(result).toEqual(mockEvent);
  });

  it('should throw NotFoundException when event not found', async () => {
    mockRepository.findById.mockResolvedValue(null);
    await expect(service.findById('1')).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when user not authorized', async () => {
    mockRepository.findById.mockResolvedValue(mockEvent);
    await expect(service.update('1', {}, 'user2')).rejects.toThrow(ForbiddenException);
  });

  it('should update event when authorized', async () => {
    mockRepository.findById.mockResolvedValue(mockEvent);
    mockRepository.update.mockResolvedValue({ ...mockEvent, title: 'Updated' });
    const result = await service.update('1', { title: 'Updated' }, 'user1');
    expect(result.title).toBe('Updated');
  });
});