import { Test } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { ReservationRepository } from './reservation.repository';
import { EventRepository } from '../events/event.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReservationStatus, EventStatus } from '@prisma/client';

describe('ReservationService', () => {
  let service: ReservationService;
  let reservationRepository: ReservationRepository;
  let eventRepository: EventRepository;

  const mockEvent = {
    id: '1',
    title: 'Test Event',
    remainingPlaces: 10,
    managerId: 'admin1',
    status: 'PUBLISHED' as EventStatus,
  };

  const mockReservation = {
    id: '1',
    userId: 'user1',
    eventId: '1',
    status: 'PENDING' as ReservationStatus,
    event: mockEvent,
  };

  const mockReservationRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByUserAndEvent: jest.fn(),
    findByUserId: jest.fn(),
    findMany: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockEventRepository = {
    findById: jest.fn(),
    updateRemainingPlaces: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: ReservationRepository, useValue: mockReservationRepository },
        { provide: EventRepository, useValue: mockEventRepository },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    reservationRepository = module.get<ReservationRepository>(ReservationRepository);
    eventRepository = module.get<EventRepository>(EventRepository);
  });

  it('should create reservation', async () => {
    mockEventRepository.findById.mockResolvedValue(mockEvent);
    mockReservationRepository.findByUserAndEvent.mockResolvedValue(null);
    mockReservationRepository.create.mockResolvedValue(mockReservation);
    
    const result = await service.create('user1', '1');
    expect(result).toEqual(mockReservation);
    expect(mockEventRepository.updateRemainingPlaces).toHaveBeenCalledWith('1', 9);
  });

  it('should throw BadRequestException when no places available', async () => {
    mockEventRepository.findById.mockResolvedValue({ ...mockEvent, remainingPlaces: 0 });
    await expect(service.create('user1', '1')).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when already reserved', async () => {
    mockEventRepository.findById.mockResolvedValue(mockEvent);
    mockReservationRepository.findByUserAndEvent.mockResolvedValue(mockReservation);
    await expect(service.create('user1', '1')).rejects.toThrow(BadRequestException);
  });

  it('should cancel reservation', async () => {
    mockReservationRepository.findById.mockResolvedValue(mockReservation);
    mockReservationRepository.updateStatus.mockResolvedValue({ ...mockReservation, status: 'CANCELED' as ReservationStatus });
    
    const result = await service.cancel('1', 'user1');
    expect(result.status).toBe('CANCELED');
    expect(mockEventRepository.updateRemainingPlaces).toHaveBeenCalledWith('1', 11);
  });
});