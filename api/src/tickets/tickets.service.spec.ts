import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service';

describe('TicketsService', () => {
  const prisma: any = {
    reservation: {
      findUnique: jest.fn(),
    },
  };

  const minioService: any = {
    refreshPresignedUrl: jest.fn(async (url: string) => `refreshed:${url}`),
    getObjectDownloadUrl: jest.fn(async () => 'http://minio/download'),
  };

  beforeAll(() => {
    process.env.TICKET_SIGNING_SECRET = 'test_ticket_signing_secret';
  });

  const service = new TicketsService(prisma, minioService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signTicket is deterministic', () => {
    const a = service.signTicket('res_1');
    const b = service.signTicket('res_1');
    const c = service.signTicket('res_2');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('verifyTicket throws when signature is missing', async () => {
    await expect(service.verifyTicket('r1', undefined)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('verifyTicket throws when signature is invalid', async () => {
    await expect(service.verifyTicket('r1', 'invalid')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('verifyTicket throws when reservation does not exist', async () => {
    prisma.reservation.findUnique.mockResolvedValue(null);
    const sig = service.signTicket('r1');
    await expect(service.verifyTicket('r1', sig)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('verifyTicket returns a structured response for a valid signature', async () => {
    prisma.reservation.findUnique.mockResolvedValue({
      id: 'r1',
      status: 'CONFIRMED',
      user: { firstName: 'A', lastName: 'B', avatarUrl: 'http://minio/avatar' },
      event: { id: 'e1', title: 'T', dateTime: new Date().toISOString(), location: 'X' },
    });

    const sig = service.signTicket('r1');
    const result = await service.verifyTicket('r1', sig);

    expect(result.valid).toBe(true);
    expect(result.reservation.id).toBe('r1');
    expect(result.reservation.participant.avatarUrl).toBe('refreshed:http://minio/avatar');
  });
});

