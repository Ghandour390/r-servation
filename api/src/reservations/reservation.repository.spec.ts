import { Test } from '@nestjs/testing';
import { ReservationRepository } from './reservation.repository';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus } from '@prisma/client';

describe('ReservationRepository', () => {
  let repository: ReservationRepository;
  let prisma: PrismaService;

  const mockReservation = {
    id: '1',
    userId: '1',
    eventId: '1',
    status: ReservationStatus.PENDING,
    ticketUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    reservation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReservationRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<ReservationRepository>(ReservationRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create reservation', async () => {
    mockPrisma.reservation.create.mockResolvedValue(mockReservation);
    const result = await repository.create(mockReservation);
    expect(result).toEqual(mockReservation);
  });

  it('should update status', async () => {
    const updated = { ...mockReservation, status: ReservationStatus.CONFIRMED };
    mockPrisma.reservation.update.mockResolvedValue(updated);
    const result = await repository.updateStatus('1', ReservationStatus.CONFIRMED);
    expect(result.status).toBe(ReservationStatus.CONFIRMED);
  });

  it('should count by event id', async () => {
    mockPrisma.reservation.count.mockResolvedValue(5);
    const result = await repository.countByEventId('1');
    expect(result).toBe(5);
  });
});