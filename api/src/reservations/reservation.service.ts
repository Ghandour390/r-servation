import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { TicketsService } from '../tickets/tickets.service';
import { Reservation, ReservationStatus, Prisma } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

  constructor(
    private reservationRepository: ReservationRepository,
    private prisma: PrismaService,
    private minioService: MinioService,
    private ticketsService: TicketsService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) { }

  async create(userId: string, eventId: string): Promise<Reservation> {
    const result = await this.prisma.$transaction(async (tx) => {
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

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true, email: true },
      });

      const reservation = await tx.reservation.create({
        data: {
          user: { connect: { id: userId } },
          event: { connect: { id: eventId } },
        },
      });

      return { reservation, event, user };
    });

    this.runAsync(async () => {
      try {
        if (!result.event?.managerId) return;
        const fullName = `${result.user?.firstName ?? ''} ${result.user?.lastName ?? ''}`.trim() || 'Un participant';
        await this.notificationsService.create({
          userId: result.event.managerId,
          type: 'RESERVATION_REQUEST',
          title: 'Nouvelle réservation',
          message: `${fullName} a réservé l'événement "${result.event.title}".`,
          link: '/dashboard/admin/reservations',
        });
      } catch (error) {
        this.logger.error(`Failed to create admin notification: ${error.message}`);
      }
    });

    return result.reservation;
  }

  async findAll(filters?: { search?: string; category?: string }): Promise<Reservation[]> {
    const where: Prisma.ReservationWhereInput = {};

    if (filters?.category) {
      where.event = { categoryId: filters.category };
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
    const result = await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: {
          event: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
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

      return { updated, reservation, previousStatus };
    });

    const shouldNotifyParticipant = result.previousStatus !== 'CONFIRMED' && status === 'CONFIRMED';
    if (shouldNotifyParticipant && result.reservation?.user?.email) {
      const participant = result.reservation.user;
      const eventTitle = result.reservation.event?.title ?? 'Votre événement';
      this.runAsync(async () => {
        try {
          await this.mailService.sendReservationConfirmation(participant.email, eventTitle);
        } catch (error) {
          this.logger.error(`Failed to send confirmation email: ${error.message}`);
        }
      });

      this.runAsync(async () => {
        try {
          await this.notificationsService.create({
            userId: participant.id,
            type: 'RESERVATION_CONFIRMED',
            title: 'Réservation confirmée',
            message: `Votre réservation pour "${eventTitle}" a été confirmée.`,
            link: '/dashboard/participant/reservations',
          });
        } catch (error) {
          this.logger.error(`Failed to create participant notification: ${error.message}`);
        }
      });
    }

    return result.updated;
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
      ? await this.minioService.refreshPresignedUrlInternal(reservation.event.imageUrl, 24 * 60 * 60)
      : undefined;

    const refreshedAvatarUrl = await this.minioService.refreshPresignedUrlInternal(
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

  private runAsync(task: () => Promise<void>) {
    setImmediate(() => {
      task().catch((error) => {
        this.logger.error(`Async task failed: ${error.message}`);
      });
    });
  }
}
