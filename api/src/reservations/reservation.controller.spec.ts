import { Test } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ReservationStatus } from '@prisma/client';

describe('ReservationController', () => {
  let controller: ReservationController;
  let service: ReservationService;

  const mockReservation = {
    id: '1',
    userId: 'user1',
    eventId: '1',
    status: ReservationStatus.PENDING,
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    updateStatus: jest.fn(),
    cancel: jest.fn(),
  };

  const mockRequest = {
    user: { sub: 'user1' },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [{ provide: ReservationService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReservationController>(ReservationController);
    service = module.get<ReservationService>(ReservationService);
  });

  it('should create reservation', async () => {
    mockService.create.mockResolvedValue(mockReservation);
    const result = await controller.create('1', mockRequest);
    expect(result).toEqual(mockReservation);
    expect(mockService.create).toHaveBeenCalledWith('user1', '1');
  });

  it('should find user reservations', async () => {
    mockService.findByUser.mockResolvedValue([mockReservation]);
    const result = await controller.findMy(mockRequest);
    expect(result).toEqual([mockReservation]);
  });

  it('should update reservation status', async () => {
    mockService.updateStatus.mockResolvedValue({ ...mockReservation, status: ReservationStatus.CONFIRMED });
    const result = await controller.updateStatus('1', { status: ReservationStatus.CONFIRMED }, mockRequest);
    expect(result.status).toBe(ReservationStatus.CONFIRMED);
  });

  it('should cancel reservation', async () => {
    mockService.cancel.mockResolvedValue({ ...mockReservation, status: ReservationStatus.CANCELED });
    const result = await controller.cancel('1', mockRequest);
    expect(result.status).toBe(ReservationStatus.CANCELED);
  });
});