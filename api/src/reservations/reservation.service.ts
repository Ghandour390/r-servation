import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { Reservation, ReservationStatus, Prisma, EventCategory } from '@prisma/client';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class ReservationService {
  constructor(
    private reservationRepository: ReservationRepository,
    private prisma: PrismaService,
    private minioService: MinioService
  ) { }

  private slugify(value: string): string {
    const normalized = value
      .toString()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '');

    return normalized
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'event';
  }

  private toBase64Url(buffer: Buffer): string {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  private signTicket(reservationId: string): string {
    const secret = process.env.TICKET_SIGNING_SECRET ?? 'dev_ticket_signing_secret';
    const digest = crypto.createHmac('sha256', secret).update(reservationId).digest();
    return this.toBase64Url(digest);
  }

  private async loadImageBuffer(source?: string): Promise<Buffer | null> {
    if (!source) return null;

    try {
      if (source.startsWith('http://') || source.startsWith('https://')) {
        const response = await fetch(source);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }

      const filePath = path.isAbsolute(source)
        ? source
        : path.resolve(process.cwd(), source);
      return await fs.readFile(filePath);
    } catch {
      return null;
    }
  }

  private async buildTicketPdf(reservation: any, eventImageUrl?: string, avatarUrl?: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // 6x4 inches badge (landscape) - width > height
        const doc = new PDFDocument({ size: [432, 288], margin: 0 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        const pageW = doc.page.width;
        const pageH = doc.page.height;
        const cardX = 12;
        const cardY = 12;
        const cardW = pageW - 24;
        const cardH = pageH - 24;
        const pad = 16;
        const headerH = 54;
        const gap = 12;

        const statusColor =
          reservation.status === 'CONFIRMED'
            ? '#10b981'
            : reservation.status === 'PENDING'
              ? '#f59e0b'
              : '#ef4444';

        const signature = this.signTicket(reservation.id);
        const sigShort = signature.slice(0, 10).toUpperCase();

        const verifyBase = (
          process.env.TICKET_VERIFY_BASE_URL ||
          process.env.PUBLIC_API_URL ||
          'http://localhost:5000'
        ).replace(/\/$/, '');
        const qrText = verifyBase
          ? `${verifyBase}/tickets/verify/${reservation.id}?sig=${signature}`
          : `eventhub:${reservation.id}:${signature}`;

        const qrBuffer = await QRCode.toBuffer(qrText, {
          type: 'png',
          errorCorrectionLevel: 'H',
          margin: 1,
          scale: 6,
        });

        // Background (dark) + subtle diagonal pattern (harder to fake by simple editing)
        doc.rect(0, 0, pageW, pageH).fill('#0b1020');
        doc.save();
        doc.opacity(0.08);
        doc.lineWidth(1);
        doc.strokeColor('#3b82f6');
        for (let i = -pageH; i < pageW; i += 12) {
          doc.moveTo(i, 0).lineTo(i + pageH, pageH).stroke();
        }
        doc.restore();

        // Card
        doc.roundedRect(cardX, cardY, cardW, cardH, 18).fill('#ffffff');
        doc.roundedRect(cardX, cardY, cardW, cardH, 18).stroke('#e5e7eb');

        // Clip to rounded card for header banner
        doc.save();
        doc.roundedRect(cardX, cardY, cardW, cardH, 18).clip();
        doc.rect(cardX, cardY, cardW, headerH).fill('#111827');
        // Accent line under header (extra anti-fake detail)
        doc.rect(cardX, cardY + headerH - 2, cardW, 2).fill('#4f46e5');
        doc.restore();

        // Header logo + text
        const logoSize = 24;
        const logoX = cardX + pad;
        const logoY = cardY + 14;
        doc.roundedRect(logoX, logoY, logoSize, logoSize, 7).fill('#4f46e5');
        doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('E', logoX, logoY + 5, { width: logoSize, align: 'center' });
        doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('EventHub', logoX + logoSize + 10, cardY + 16);
        doc.fillColor('#9ca3af').fontSize(9).font('Helvetica').text('Event Badge / Ticket', logoX + logoSize + 10, cardY + 36);

        // Status pill
        const pillW = 92;
        const pillH = 20;
        const pillX = cardX + cardW - pad - pillW;
        const pillY = cardY + 18;
        doc.roundedRect(pillX, pillY, pillW, pillH, 11).fill(statusColor);
        doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text(
          String(reservation.status),
          pillX,
          pillY + 5,
          { width: pillW, align: 'center' },
        );

        // Watermark
        doc.save();
        doc.opacity(0.05);
        doc.fillColor('#111827');
        doc.rotate(-20, { origin: [pageW / 2, pageH / 2] });
        doc.fontSize(48).font('Helvetica-Bold').text('EventHub', -60, pageH / 2 - 30, { width: pageW + 120, align: 'center' });
        doc.restore();

        const bodyY = cardY + headerH + 12;
        const rightColW = 168;
        const rightColX = cardX + cardW - pad - rightColW;
        const leftColX = cardX + pad;
        const leftColW = rightColX - leftColX - gap;

        // Event image banner (right column)
        const bannerX = rightColX;
        const bannerY = bodyY;
        const bannerW = rightColW;
        const bannerH = 82;

        const fallbackEventImage = process.env.TICKET_FALLBACK_IMAGE_PATH || 'assets/event.avif';
        const eventImageBuffer =
          (await this.loadImageBuffer(eventImageUrl)) ||
          (await this.loadImageBuffer(fallbackEventImage));

        doc.save();
        doc.roundedRect(bannerX, bannerY, bannerW, bannerH, 14).clip();
        if (eventImageBuffer) {
          try {
            doc.image(eventImageBuffer, bannerX, bannerY, { fit: [bannerW, bannerH], align: 'center', valign: 'center' });
          } catch {
            doc.rect(bannerX, bannerY, bannerW, bannerH).fill('#111827');
            doc.save();
            doc.opacity(0.18);
            doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('EventHub', bannerX, bannerY + 26, { width: bannerW, align: 'center' });
            doc.restore();
          }
        } else {
          doc.rect(bannerX, bannerY, bannerW, bannerH).fill('#111827');
          doc.save();
          doc.opacity(0.18);
          doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('EventHub', bannerX, bannerY + 26, { width: bannerW, align: 'center' });
          doc.restore();
        }
        doc.restore();
        doc.roundedRect(bannerX, bannerY, bannerW, bannerH, 14).stroke('#e5e7eb');

        // Avatar (left column)
        const avatarR = 26;
        const avatarCX = leftColX + avatarR;
        const avatarCY = bodyY + avatarR;
        const avatarBuffer = await this.loadImageBuffer(avatarUrl);
        doc.save();
        doc.circle(avatarCX, avatarCY, avatarR).clip();
        if (avatarBuffer) {
          try {
            doc.image(avatarBuffer, avatarCX - avatarR, avatarCY - avatarR, { width: avatarR * 2, height: avatarR * 2 });
          } catch {
            doc.rect(avatarCX - avatarR, avatarCY - avatarR, avatarR * 2, avatarR * 2).fill('#e5e7eb');
          }
        } else {
          doc.rect(avatarCX - avatarR, avatarCY - avatarR, avatarR * 2, avatarR * 2).fill('#e5e7eb');
        }
        doc.restore();
        doc.circle(avatarCX, avatarCY, avatarR).lineWidth(3).stroke('#ffffff');
        doc.circle(avatarCX, avatarCY, avatarR).lineWidth(1).stroke('#d1d5db');

        const participantName = `${reservation.user?.firstName ?? ''} ${reservation.user?.lastName ?? ''}`.trim();
        const participantEmail = String(reservation.user?.email ?? '');
        const title = String(reservation.event?.title ?? 'Event');
        const dateValue = reservation.event?.dateTime ? new Date(reservation.event.dateTime).toLocaleString() : '';
        const locationValue = String(reservation.event?.location ?? '');
        const badgeIdShort = String(reservation.id).slice(-10).toUpperCase();

        // Participant name + email next to avatar
        const nameX = avatarCX + avatarR + 10;
        const nameW = Math.max(10, leftColX + leftColW - nameX);
        doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold').text(participantName || 'Participant', nameX, bodyY + 2, { width: nameW, ellipsis: true });
        doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text(participantEmail, nameX, bodyY + 20, { width: nameW, ellipsis: true });

        // Event title + details (below)
        const titleY = bodyY + avatarR * 2 + 12;
        doc.fillColor('#111827').fontSize(15).font('Helvetica-Bold').text(title, leftColX, titleY, { width: leftColW, lineGap: 2, ellipsis: true });

        const infoY = titleY + 40;
        doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text('Date', leftColX, infoY);
        doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold').text(dateValue, leftColX, infoY + 10, { width: leftColW, ellipsis: true });

        doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text('Location', leftColX, infoY + 28);
        doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold').text(locationValue, leftColX, infoY + 38, { width: leftColW, ellipsis: true });

        // QR Code (verification) + signature microtext
        const qrSize = 72;
        const qrX = bannerX + bannerW - qrSize;
        const qrY = bannerY + bannerH + 14;
        doc.roundedRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 12).fill('#ffffff').stroke('#e5e7eb');
        doc.image(qrBuffer, qrX, qrY, { fit: [qrSize, qrSize] });

        doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text('Scan to verify', bannerX, qrY + qrSize + 6, { width: bannerW, align: 'center' });

        // Security footer
        const micro = `EVENTHUB|${sigShort}|${badgeIdShort}|`;
        doc.save();
        doc.opacity(0.8);
        doc.fillColor('#9ca3af').fontSize(6).font('Helvetica').text(micro.repeat(14), cardX + pad, cardY + cardH - 18, {
          width: cardW - pad * 2,
          align: 'center',
        });
        doc.restore();

        // Badge ID
        doc.fillColor('#6b7280').fontSize(9).font('Helvetica').text(`Badge ID: ${badgeIdShort}`, cardX + pad, cardY + cardH - 48);
        doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text(`SIG: ${sigShort}`, cardX + pad, cardY + cardH - 34);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

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

    const badgeIdShort = String(reservation.id).slice(-10).toUpperCase();
    const eventSlug = this.slugify(String(reservation.event?.title ?? 'event'));
    const downloadFileName = `EventHub-Badge-${eventSlug}-${badgeIdShort}.pdf`;

    const ticketKeyPrefix = 'tickets/badges-v1/';
    if (
      reservation.ticketKey &&
      reservation.ticketKey.startsWith(ticketKeyPrefix) &&
      reservation.ticketKey.endsWith('.pdf')
    ) {
      const ticketUrl = await this.minioService.getObjectDownloadUrl(
        reservation.ticketKey,
        24 * 60 * 60,
        downloadFileName,
        'application/pdf',
      );
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

    const pdfBuffer = await this.buildTicketPdf(reservation, refreshedEventImageUrl, refreshedAvatarUrl);
    const ticketKey = `${ticketKeyPrefix}${reservation.id}.pdf`;
    await this.minioService.uploadTicket(ticketKey, pdfBuffer);
    const ticketUrl = await this.minioService.getObjectDownloadUrl(
      ticketKey,
      24 * 60 * 60,
      downloadFileName,
      'application/pdf',
    );

    await this.prisma.reservation.update({
      where: { id: reservation.id },
      data: { ticketUrl, ticketKey },
    });

    return { ticketUrl };
  }

  async verifyTicket(reservationId: string, signature?: string) {
    if (!signature) {
      throw new BadRequestException('Missing ticket signature');
    }

    const expected = this.signTicket(reservationId);
    if (signature !== expected) {
      throw new BadRequestException('Invalid ticket signature');
    }

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { user: true, event: true },
    }) as any;

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const avatarUrl = reservation.user?.avatarUrl
      ? await this.minioService.refreshPresignedUrl(reservation.user.avatarUrl, 60 * 60)
      : undefined;

    return {
      valid: reservation.status === 'CONFIRMED',
      reservation: {
        id: reservation.id,
        status: reservation.status,
        badgeId: String(reservation.id).slice(-10).toUpperCase(),
        participant: {
          firstName: reservation.user?.firstName,
          lastName: reservation.user?.lastName,
          avatarUrl,
        },
        event: {
          id: reservation.event?.id,
          title: reservation.event?.title,
          dateTime: reservation.event?.dateTime,
          location: reservation.event?.location,
        },
      },
    };
  }
}
