import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { TicketsService } from '../tickets/tickets.service';
import { Reservation, ReservationStatus, Prisma, EventCategory } from '@prisma/client';

@Injectable()
export class ReservationService {
  constructor(
    private reservationRepository: ReservationRepository,
    private prisma: PrismaService,
    private minioService: MinioService,
    private ticketsService: TicketsService,
  ) { }

  async create(userId: string, eventId: string): Promise<Reservation> {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new NotFoundException('Event not found');
      if (event.status !== 'PUBLISHED') throw new BadRequestException('Event is not published');

      const existing = await tx.reservation.findUnique({
        where: { userId_eventId: { userId, eventId } },
      });
      if (existing) throw new BadRequestException('Already reserved');

      const updated = await tx.event.updateMany({
        where: { id: eventId, remainingPlaces: { gt: 0 } },
        data: { remainingPlaces: { decrement: 1 } },
      });

      if (updated.count === 0) {
        throw new BadRequestException('No places available');
      }

      return tx.reservation.create({
        data: {
          user: { connect: { id: userId } },
          event: { connect: { id: eventId } },
        },
      });
    });
  }

  async findAll(filters?: { search?: string; category?: EventCategory }): Promise<Reservation[]> {
    const where: Prisma.ReservationWhereInput = {};

    if (filters?.category) {
      where.event = { category: filters.category };
    }

    if (filters?.search) {
      where.OR = [
        { event: { title: { contains: filters.search, mode: 'insensitive' } } },
        { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return this.reservationRepository.findMany({
      where,
      include: { user: true, event: true }
    });
  }

  async findById(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async findByUser(userId: string): Promise<Reservation[]> {
    return this.reservationRepository.findByUserId(userId);
  }

  async updateStatus(id: string, status: ReservationStatus, userId: string): Promise<Reservation> {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: { event: true },
      }) as any;
      if (!reservation) throw new NotFoundException('Reservation not found');
      if (reservation.event.managerId !== userId) throw new ForbiddenException('Not authorized');

      const previousStatus = reservation.status;
      const updated = await tx.reservation.update({
        where: { id },
        data: { status },
      });

      const releaseStatuses: ReservationStatus[] = ['CANCELED', 'REFUSED'];
      if (releaseStatuses.includes(status) && !releaseStatuses.includes(previousStatus)) {
        await tx.event.update({
          where: { id: reservation.eventId },
          data: { remainingPlaces: { increment: 1 } },
        });
      }

      return updated;
    });
  }

  async delete(id: string, userId: string): Promise<Reservation> {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: { event: true },
      }) as any;
      if (!reservation) throw new NotFoundException('Reservation not found');

      if (reservation.userId !== userId) throw new ForbiddenException('Not authorized');

      const releaseStatuses: ReservationStatus[] = ['PENDING', 'CONFIRMED'];
      if (releaseStatuses.includes(reservation.status)) {
        await tx.event.update({
          where: { id: reservation.eventId },
          data: { remainingPlaces: { increment: 1 } },
        });
      }

      return tx.reservation.delete({ where: { id } });
    });
  }

  // Legacy cancel method - updating to use delete logic or retiring if needed
  async cancel(id: string, userId: string): Promise<Reservation> {
    return this.delete(id, userId);
  }

  async getTicketUrl(reservationId: string, user: { id: string; role: string }) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { user: true, event: true },
    }) as any;
    if (!reservation) throw new NotFoundException('Reservation not found');

    const isOwner = reservation.userId === user.id;
    const isManager = reservation.event?.managerId === user.id;
    const isAdmin = user.role === 'ADMIN';
    if (!isOwner && !isManager && !isAdmin) {
      throw new ForbiddenException('Not authorized');
    }

    if (isOwner && reservation.status !== 'CONFIRMED') {
      throw new BadRequestException('Ticket is available only for confirmed reservations.');
    }

    const downloadFileName = this.ticketsService.getDownloadFileName(reservation.id, reservation.event?.title);

    const ticketKeyPrefix = 'tickets/badges-v1/';
    if (
      reservation.ticketKey &&
      reservation.ticketKey.startsWith(ticketKeyPrefix) &&
      reservation.ticketKey.endsWith('.pdf')
    ) {
      const ticketUrl = await this.ticketsService.getTicketDownloadUrl(reservation.ticketKey, downloadFileName);
      return { ticketUrl };
    }

    if (!reservation.user?.avatarUrl) {
      throw new BadRequestException('Profile photo is required before downloading the ticket.');
    }

    const refreshedEventImageUrl = reservation.event?.imageUrl
      ? await this.minioService.refreshPresignedUrl(reservation.event.imageUrl, 24 * 60 * 60)
      : undefined;

    const refreshedAvatarUrl = await this.minioService.refreshPresignedUrl(
      reservation.user.avatarUrl,
      24 * 60 * 60
    );

    const pdfBuffer = await this.ticketsService.buildBadgePdf(reservation, refreshedEventImageUrl, refreshedAvatarUrl);
    const ticketKey = `${ticketKeyPrefix}${reservation.id}.pdf`;
    await this.minioService.uploadTicket(ticketKey, pdfBuffer);
    const ticketUrl = await this.ticketsService.getTicketDownloadUrl(ticketKey, downloadFileName);

    await this.prisma.reservation.update({
      where: { id: reservation.id },
      data: { ticketUrl, ticketKey },
    });

    return { ticketUrl };
  }
}
