import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReservationService } from './reservation.service';

describe('ReservationService (tickets)', () => {
  const reservationRepository: any = {
    findMany: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
  };

  const prisma: any = {
    reservation: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    event: {
      update: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => fn(prisma)),
  };

  const minioService: any = {
    refreshPresignedUrl: jest.fn(async (url: string) => url),
    refreshPresignedUrlInternal: jest.fn(async (url: string) => url),
    uploadTicket: jest.fn(async () => {}),
    getObjectUrl: jest.fn(async () => 'http://minio/presigned'),
  };

  const ticketsService: any = {
    getDownloadFileName: jest.fn(() => 'EventHub-Badge-test-ABCDE12345.pdf'),
    getTicketDownloadUrl: jest.fn(async () => 'http://minio/download'),
    buildBadgePdf: jest.fn(async () => Buffer.from('%PDF-1.4')),
  };

  const mailService: any = {
    sendReservationConfirmation: jest.fn(async () => {}),
  };

  const notificationsService: any = {
    create: jest.fn(async () => ({})),
  };

  const service = new ReservationService(
    reservationRepository,
    prisma,
    minioService,
    ticketsService,
    mailService,
    notificationsService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks owner from downloading ticket if reservation not confirmed', async () => {
    prisma.reservation.findUnique.mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      status: 'PENDING',
      user: { id: 'u1', avatarUrl: 'http://minio/avatar' },
      event: { id: 'e1', title: 'Event', managerId: 'admin1' },
    });

    await expect(service.getTicketUrl('r1', { id: 'u1', role: 'PARTICIPANT' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns a download url if ticketKey already exists', async () => {
    prisma.reservation.findUnique.mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      status: 'CONFIRMED',
      ticketKey: 'tickets/badges-v1/r1.pdf',
      user: { id: 'u1', avatarUrl: 'http://minio/avatar' },
      event: { id: 'e1', title: 'My Event', managerId: 'admin1' },
    });

    const res = await service.getTicketUrl('r1', { id: 'u1', role: 'PARTICIPANT' });
    expect(res.ticketUrl).toBe('http://minio/download');
    expect(ticketsService.getTicketDownloadUrl).toHaveBeenCalledWith('tickets/badges-v1/r1.pdf', expect.any(String));
    expect(minioService.uploadTicket).not.toHaveBeenCalled();
  });

  it('requires avatarUrl before generating a ticket', async () => {
    prisma.reservation.findUnique.mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      status: 'CONFIRMED',
      ticketKey: null,
      user: { id: 'u1', avatarUrl: null },
      event: { id: 'e1', title: 'My Event', managerId: 'admin1' },
    });

    await expect(service.getTicketUrl('r1', { id: 'u1', role: 'PARTICIPANT' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('forbids non-owner/non-manager/non-admin', async () => {
    prisma.reservation.findUnique.mockResolvedValue({
      id: 'r1',
      userId: 'owner1',
      status: 'CONFIRMED',
      ticketKey: null,
      user: { id: 'owner1', avatarUrl: 'http://minio/avatar' },
      event: { id: 'e1', title: 'My Event', managerId: 'manager1' },
    });

    await expect(service.getTicketUrl('r1', { id: 'other', role: 'PARTICIPANT' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});

