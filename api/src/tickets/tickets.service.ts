import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import * as crypto from 'node:crypto';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

type ParticipantRow = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {}

  signTicket(reservationId: string): string {
    const secret = process.env.TICKET_SIGNING_SECRET;
    if (!secret) {
      throw new Error('TICKET_SIGNING_SECRET is not set');
    }
    return crypto.createHmac('sha256', secret).update(reservationId).digest('hex');
  }

  async verifyTicket(reservationId: string, sig?: string) {
    if (!sig) throw new BadRequestException('Missing signature');

    const expected = this.signTicket(reservationId);
    if (!this.safeEqualHex(sig, expected)) {
      throw new BadRequestException('Invalid signature');
    }

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
        event: { select: { id: true, title: true, dateTime: true, location: true } },
      },
    }) as any;

    if (!reservation) throw new NotFoundException('Reservation not found');

    const refreshedAvatarUrl = reservation.user?.avatarUrl
      ? await this.minioService.refreshPresignedUrl(reservation.user.avatarUrl, 60 * 60)
      : null;

    return {
      valid: true,
      reservation: {
        id: reservation.id,
        status: reservation.status,
        participant: {
          firstName: reservation.user?.firstName,
          lastName: reservation.user?.lastName,
          avatarUrl: refreshedAvatarUrl,
        },
        event: reservation.event,
      },
    };
  }

  getDownloadFileName(reservationId: string, eventTitle?: string | null): string {
    const safeTitle = this.slugify(eventTitle || 'event');
    const shortId = reservationId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'ticket';
    return `EventHub-Badge-${safeTitle}-${shortId}.pdf`;
  }

  getParticipantsDownloadFileName(eventTitle?: string | null): string {
    const safeTitle = this.slugify(eventTitle || 'event');
    return `EventHub-Participants-${safeTitle}.pdf`;
  }

  async getTicketDownloadUrl(ticketKey: string, downloadFileName: string): Promise<string> {
    return this.minioService.getObjectDownloadUrl(
      ticketKey,
      24 * 60 * 60,
      downloadFileName,
      'application/pdf',
    );
  }

  async buildBadgePdf(
    reservation: any,
    eventImageUrl?: string,
    avatarUrl?: string,
  ): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });

    const chunks: Buffer[] = [];
    doc.on('data', (d) => chunks.push(d));

    const title = reservation?.event?.title || 'Event';
    const location = reservation?.event?.location || '';
    const dateTime = reservation?.event?.dateTime ? new Date(reservation.event.dateTime) : null;
    const participantName =
      `${reservation?.user?.firstName || ''} ${reservation?.user?.lastName || ''}`.trim() || 'Participant';

    doc.fontSize(22).fillColor('#0f172a').text('EventHub Ticket', { align: 'left' });
    doc.moveDown(0.4);
    doc.fontSize(16).fillColor('#111827').text(title);
    doc.fontSize(11).fillColor('#475569').text([location, dateTime ? dateTime.toLocaleString() : ''].filter(Boolean).join(' • '));

    doc.moveDown(1.1);
    doc.fontSize(13).fillColor('#0f172a').text(`Participant: ${participantName}`);
    doc.fontSize(11).fillColor('#475569').text(`Reservation: ${reservation?.id || ''}`);

    const qrPayload = JSON.stringify({
      reservationId: String(reservation?.id || ''),
      sig: this.signTicket(String(reservation?.id || '')),
    });
    const qr = await QRCode.toBuffer(qrPayload, { type: 'png', margin: 1, scale: 7 });

    const currentY = doc.y + 18;
    const leftX = 48;
    const qrSize = 170;

    doc
      .roundedRect(leftX, currentY, 320, 210, 14)
      .fillOpacity(0.04)
      .fillAndStroke('#3f4b99', '#d1d5db');
    doc.fillOpacity(1);

    doc.image(qr, leftX + 24, currentY + 20, { width: qrSize, height: qrSize });
    doc
      .fontSize(10)
      .fillColor('#475569')
      .text('Scan to verify', leftX + 24, currentY + 195, { width: qrSize, align: 'center' });

    const imageBoxX = leftX + 24 + qrSize + 24;
    const imageBoxY = currentY + 20;
    const imageBoxW = 320 - (24 + qrSize + 24 + 24);
    const imageBoxH = 170;

    const [eventImg, avatarImg] = await Promise.all([
      this.tryFetchImage(eventImageUrl),
      this.tryFetchImage(avatarUrl),
    ]);

    if (eventImg) {
      try {
        doc.image(eventImg, imageBoxX, imageBoxY, { width: imageBoxW, height: imageBoxH, fit: [imageBoxW, imageBoxH] });
      } catch (error) {
        console.error('Error adding event image to PDF:', error);
      }
    } else {
      doc
        .roundedRect(imageBoxX, imageBoxY, imageBoxW, imageBoxH, 10)
        .fillOpacity(0.05)
        .fill('#111827');
      doc.fillOpacity(1);
    }

    if (avatarImg) {
      try {
        doc.save();
        doc.circle(imageBoxX + imageBoxW - 34, imageBoxY + imageBoxH - 34, 28).clip();
        doc.image(avatarImg, imageBoxX + imageBoxW - 62, imageBoxY + imageBoxH - 62, { width: 56, height: 56 });
        doc.restore();
      } catch (error) {
        console.error('Error adding avatar image to PDF:', error);
      }
    }

    doc.moveDown(12);
    doc.fontSize(9).fillColor('#64748b').text('Generated by EventHub • This ticket is valid only if the reservation is confirmed.', { align: 'left' });

    doc.end();

    return await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  }

  async buildParticipantsListPdf(
    event: any,
    participants: ParticipantRow[],
    eventImageUrl?: string,
  ): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks: Buffer[] = [];
    doc.on('data', (d) => chunks.push(d));

    const title = event?.title || 'Event';
    doc.fontSize(20).fillColor('#0f172a').text('Participants', { align: 'left' });
    doc.moveDown(0.2);
    doc.fontSize(14).fillColor('#111827').text(title);
    doc.moveDown(0.8);

    const eventImg = await this.tryFetchImage(eventImageUrl);
    if (eventImg) {
      try {
        doc.image(eventImg, 48, doc.y, { width: 160, height: 90, fit: [160, 90] });
      } catch(error) {
        console.error('Error adding event image to PDF:', error);
      }
    }

    doc.moveDown(0.8);
    doc.fontSize(10).fillColor('#475569').text(`Total confirmed participants: ${participants.length}`);
    doc.moveDown(0.8);

    const startY = doc.y;
    const colX = { idx: 48, name: 78, email: 320 };
    doc.fontSize(10).fillColor('#0f172a');
    doc.text('#', colX.idx, startY, { width: 24 });
    doc.text('Name', colX.name, startY, { width: 230 });
    doc.text('Email', colX.email, startY, { width: 240 });
    doc.moveTo(48, startY + 16).lineTo(547, startY + 16).strokeColor('#e2e8f0').stroke();
    doc.moveDown(0.6);

    participants.forEach((p, i) => {
      const y = doc.y;
      if (y > 760) {
        doc.addPage();
      }

      const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || '—';
      doc.fontSize(10).fillColor('#0f172a').text(String(i + 1), colX.idx, doc.y, { width: 24 });
      doc.text(fullName, colX.name, y, { width: 230 });
      doc.fillColor('#475569').text(p.email || '—', colX.email, y, { width: 240 });
      doc.moveDown(0.5);
    });

    doc.end();
    return await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'event';
  }

  private safeEqualHex(a: string, b: string): boolean {
    if (!/^[0-9a-f]+$/i.test(a) || !/^[0-9a-f]+$/i.test(b)) return false;
    if (a.length !== b.length) return false;
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    return crypto.timingSafeEqual(ba, bb);
  }

  private async tryFetchImage(url?: string | null): Promise<Buffer | null> {
    if (!url) return null;
    if (typeof fetch !== 'function') return null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      return Buffer.from(arr);
    } catch {
      return null;
    }
  }
}
