import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {}

  private slugify(value: string): string {
    const normalized = value
      .toString()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '');

    return (
      normalized
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50) || 'event'
    );
  }

  private toBase64Url(buffer: Buffer): string {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  signTicket(reservationId: string): string {
    const secret = process.env.TICKET_SIGNING_SECRET;
    if (!secret) {
      throw new BadRequestException('TICKET_SIGNING_SECRET is not configured');
    }
    const digest = crypto.createHmac('sha256', secret).update(reservationId).digest();
    return this.toBase64Url(digest);
  }

  getDownloadFileName(reservationId: string, eventTitle?: string): string {
    const badgeIdShort = String(reservationId).slice(-10).toUpperCase();
    const eventSlug = this.slugify(String(eventTitle ?? 'event'));
    return `EventHub-Badge-${eventSlug}-${badgeIdShort}.pdf`;
  }

  getParticipantsDownloadFileName(eventTitle?: string): string {
    const eventSlug = this.slugify(String(eventTitle ?? 'event'));
    const datePart = new Date().toISOString().slice(0, 10);
    return `EventHub-Participants-${eventSlug}-${datePart}.pdf`;
  }

  async getTicketDownloadUrl(ticketKey: string, downloadFileName: string): Promise<string> {
    return this.minioService.getObjectDownloadUrl(ticketKey, 24 * 60 * 60, downloadFileName, 'application/pdf');
  }

  private async loadImageBuffer(source?: string): Promise<Buffer | null> {
    if (!source) return null;

    try {
      if (source.startsWith('http://') || source.startsWith('https://')) {
        const response = await fetch(source);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        const raw = Buffer.from(arrayBuffer);
        const normalized = await this.normalizeImageBuffer(raw);
        return normalized ?? raw;
      }

      const filePath = path.isAbsolute(source) ? source : path.resolve(process.cwd(), source);
      const raw = await fs.readFile(filePath);
      const normalized = await this.normalizeImageBuffer(raw);
      return normalized ?? raw;
    } catch {
      return null;
    }
  }

  private async normalizeImageBuffer(buffer: Buffer): Promise<Buffer | null> {
    try {
      return await sharp(buffer).png().toBuffer();
    } catch {
      return null;
    }
  }

  async buildBadgePdf(reservation: any, eventImageUrl?: string, avatarUrl?: string): Promise<Buffer> {
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
        doc
          .fillColor('#ffffff')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('E', logoX, logoY + 5, { width: logoSize, align: 'center' });
        doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('EventHub', logoX + logoSize + 10, cardY + 16);
        doc
          .fillColor('#9ca3af')
          .fontSize(9)
          .font('Helvetica')
          .text('Event Badge / Ticket', logoX + logoSize + 10, cardY + 36);

        // Status pill
        const pillW = 92;
        const pillH = 20;
        const pillX = cardX + cardW - pad - pillW;
        const pillY = cardY + 18;
        doc.roundedRect(pillX, pillY, pillW, pillH, 11).fill(statusColor);
        doc
          .fillColor('#ffffff')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(String(reservation.status), pillX, pillY + 5, { width: pillW, align: 'center' });

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
          (await this.loadImageBuffer(eventImageUrl)) || (await this.loadImageBuffer(fallbackEventImage));

        doc.save();
        doc.roundedRect(bannerX, bannerY, bannerW, bannerH, 14).clip();
        if (eventImageBuffer) {
          try {
            doc.image(eventImageBuffer, bannerX, bannerY, {
              fit: [bannerW, bannerH],
              align: 'center',
              valign: 'center',
            });
          } catch {
            doc.rect(bannerX, bannerY, bannerW, bannerH).fill('#111827');
            doc.save();
            doc.opacity(0.18);
            doc
              .fillColor('#ffffff')
              .fontSize(20)
              .font('Helvetica-Bold')
              .text('EventHub', bannerX, bannerY + 26, { width: bannerW, align: 'center' });
            doc.restore();
          }
        } else {
          doc.rect(bannerX, bannerY, bannerW, bannerH).fill('#111827');
          doc.save();
          doc.opacity(0.18);
          doc
            .fillColor('#ffffff')
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('EventHub', bannerX, bannerY + 26, { width: bannerW, align: 'center' });
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
            doc.image(avatarBuffer, avatarCX - avatarR, avatarCY - avatarR, {
              width: avatarR * 2,
              height: avatarR * 2,
            });
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
        doc
          .fillColor('#111827')
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(participantName || 'Participant', nameX, bodyY + 2, { width: nameW, ellipsis: true });
        doc
          .fillColor('#6b7280')
          .fontSize(8)
          .font('Helvetica')
          .text(participantEmail, nameX, bodyY + 20, { width: nameW, ellipsis: true });

        // Event title + details (below)
        const titleY = bodyY + avatarR * 2 + 12;
        doc
          .fillColor('#111827')
          .fontSize(15)
          .font('Helvetica-Bold')
          .text(title, leftColX, titleY, { width: leftColW, lineGap: 2, ellipsis: true });

        const infoY = titleY + 40;
        doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text('Date', leftColX, infoY);
        doc
          .fillColor('#111827')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(dateValue, leftColX, infoY + 10, { width: leftColW, ellipsis: true });

        doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text('Location', leftColX, infoY + 28);
        doc
          .fillColor('#111827')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(locationValue, leftColX, infoY + 38, { width: leftColW, ellipsis: true });

        // QR Code (verification)
        const qrSize = 72;
        const qrX = bannerX + bannerW - qrSize;
        const qrY = bannerY + bannerH + 14;
        doc.roundedRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 12).fill('#ffffff').stroke('#e5e7eb');
        doc.image(qrBuffer, qrX, qrY, { fit: [qrSize, qrSize] });
        doc
          .fillColor('#6b7280')
          .fontSize(8)
          .font('Helvetica')
          .text('Scan to verify', bannerX, qrY + qrSize + 6, { width: bannerW, align: 'center' });

        // Security footer
        const microToken = `EVENTHUB|${sigShort}|${badgeIdShort}|`;
        const microMaxW = cardW - pad * 2;
        doc.save();
        doc.opacity(0.8);
        doc.fillColor('#9ca3af').fontSize(6).font('Helvetica');
        let microText = '';
        while (doc.widthOfString(microText + microToken) <= microMaxW) {
          microText += microToken;
        }
        if (!microText) microText = microToken;
        doc.text(microText, cardX + pad, cardY + cardH - 18, {
          width: microMaxW,
          align: 'center',
          lineBreak: false,
        });
        doc.restore();

        doc.fillColor('#6b7280').fontSize(9).font('Helvetica').text(`Badge ID: ${badgeIdShort}`, cardX + pad, cardY + cardH - 48);
        doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text(`SIG: ${sigShort}`, cardX + pad, cardY + cardH - 34);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private getInitials(firstName?: string, lastName?: string): string {
    const first = String(firstName ?? '').trim().charAt(0);
    const last = String(lastName ?? '').trim().charAt(0);
    return (first + last).toUpperCase() || 'P';
  }

  async buildParticipantsListPdf(
    event: any,
    participants: Array<{ firstName?: string; lastName?: string; email?: string; avatarUrl?: string | null }>,
    eventImageUrl?: string,
  ): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 36 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        const pageW = doc.page.width;
        const pageH = doc.page.height;
        const margin = 36;
        const contentW = pageW - margin * 2;
        const headerH = 96;
        const tableHeaderH = 26;
        const rowH = 56;
        const colAvatarW = 60;
        const colLastW = 150;
        const colFirstW = 150;
        const colEmailW = Math.max(120, contentW - colAvatarW - colLastW - colFirstW);
        const headerImageW = 120;
        const headerImageH = 68;
        const headerImageX = pageW - margin - headerImageW;
        const headerImageY = 14;

        const title = String(event?.title ?? 'Event');
        const dateValue = event?.dateTime ? new Date(event.dateTime).toLocaleString() : '';
        const locationValue = String(event?.location ?? '');
        const meta = [dateValue, locationValue].filter(Boolean).join(' • ');
        const countLabel = `${participants.length} confirmed participant${participants.length === 1 ? '' : 's'}`;

        const drawHeader = () => {
          doc.rect(0, 0, pageW, headerH).fill('#111827');
          doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('EventHub', margin, 20);
          doc.fillColor('#c7d2fe').fontSize(10).font('Helvetica').text('Confirmed Participants', margin, 42);
          const titleMaxW = contentW - headerImageW - 12;
          doc.fillColor('#ffffff').fontSize(13).font('Helvetica-Bold').text(title, margin, 58, { width: titleMaxW });
          if (meta) {
            doc.fillColor('#9ca3af').fontSize(9).font('Helvetica').text(meta, margin, 76, { width: titleMaxW });
          }
          doc.fillColor('#a5b4fc').fontSize(9).font('Helvetica').text(countLabel, margin, 88, { width: titleMaxW });

          doc.save();
          doc.roundedRect(headerImageX, headerImageY, headerImageW, headerImageH, 10).clip();
          doc.rect(headerImageX, headerImageY, headerImageW, headerImageH).fill('#0f172a');
          doc.restore();
        };

        const drawHeaderImageFallback = (label: string) => {
          doc.save();
          doc.roundedRect(headerImageX, headerImageY, headerImageW, headerImageH, 10).clip();
          doc.rect(headerImageX, headerImageY, headerImageW, headerImageH).fill('#1f2937');
          doc.rect(headerImageX, headerImageY + headerImageH * 0.55, headerImageW, headerImageH * 0.45).fill('#0f172a');
          doc.restore();
          doc
            .fillColor('#e5e7eb')
            .fontSize(8)
            .font('Helvetica-Bold')
            .text(label, headerImageX + 8, headerImageY + headerImageH - 18, { width: headerImageW - 16, ellipsis: true });
        };

        const drawTableHeader = (y: number) => {
          doc.rect(margin, y, contentW, tableHeaderH).fill('#e5e7eb');
          doc.fillColor('#111827').fontSize(9).font('Helvetica-Bold');
          doc.text('Avatar', margin + 8, y + 8);
          doc.text('Last name', margin + colAvatarW + 8, y + 8);
          doc.text('First name', margin + colAvatarW + colLastW + 8, y + 8);
          doc.text('Email', margin + colAvatarW + colLastW + colFirstW + 8, y + 8);
          doc.strokeColor('#d1d5db').lineWidth(1).rect(margin, y, contentW, tableHeaderH).stroke();
          return y + tableHeaderH;
        };

        drawHeader();

        const fallbackEventImage = process.env.TICKET_FALLBACK_IMAGE_PATH || 'assets/event.avif';
        const eventImageBuffer =
          (await this.loadImageBuffer(eventImageUrl)) || (await this.loadImageBuffer(fallbackEventImage));
        let imageDrawn = false;
        if (eventImageBuffer) {
          try {
            doc.save();
            doc.roundedRect(headerImageX, headerImageY, headerImageW, headerImageH, 10).clip();
            doc.image(eventImageBuffer, headerImageX, headerImageY, {
              fit: [headerImageW, headerImageH],
              align: 'center',
              valign: 'center',
            });
            doc.restore();
            imageDrawn = true;
          } catch {
            // Keep fallback dark block if image fails
          }
        }
        if (!imageDrawn) {
          drawHeaderImageFallback(title);
        }

        doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text('Participants', margin, headerH + 8);
        let cursorY = drawTableHeader(headerH + 24);

        if (participants.length === 0) {
          doc
            .fillColor('#6b7280')
            .fontSize(12)
            .font('Helvetica')
            .text('No confirmed participants for this event.', margin, cursorY + 30, { width: contentW });
          doc.end();
          return;
        }

        for (let i = 0; i < participants.length; i += 1) {
          const participant = participants[i];
          if (cursorY + rowH > pageH - margin) {
            doc.addPage();
            drawHeader();
            cursorY = drawTableHeader(headerH + 16);
          }

          const rowBg = i % 2 === 0 ? '#ffffff' : '#f3f4f6';
          doc.rect(margin, cursorY, contentW, rowH).fill(rowBg);
          doc.strokeColor('#e5e7eb').lineWidth(1).rect(margin, cursorY, contentW, rowH).stroke();

          const avatarCX = margin + colAvatarW / 2;
          const avatarCY = cursorY + rowH / 2;
          const avatarR = 18;
          const avatarBuffer = await this.loadImageBuffer(participant.avatarUrl ?? undefined);

          if (avatarBuffer) {
            try {
              doc.save();
              doc.circle(avatarCX, avatarCY, avatarR).clip();
              doc.image(avatarBuffer, avatarCX - avatarR, avatarCY - avatarR, {
                width: avatarR * 2,
                height: avatarR * 2,
              });
              doc.restore();
            } catch {
              doc.circle(avatarCX, avatarCY, avatarR).fill('#6366f1');
              doc
                .fillColor('#ffffff')
                .fontSize(10)
                .font('Helvetica-Bold')
                .text(this.getInitials(participant.firstName, participant.lastName), avatarCX - avatarR, avatarCY - 5, {
                  width: avatarR * 2,
                  align: 'center',
                });
            }
          } else {
            doc.circle(avatarCX, avatarCY, avatarR).fill('#6366f1');
            doc
              .fillColor('#ffffff')
              .fontSize(10)
              .font('Helvetica-Bold')
              .text(this.getInitials(participant.firstName, participant.lastName), avatarCX - avatarR, avatarCY - 5, {
                width: avatarR * 2,
                align: 'center',
              });
          }
          doc.circle(avatarCX, avatarCY, avatarR).lineWidth(1).stroke('#e5e7eb');

          doc.fillColor('#111827').fontSize(10).font('Helvetica');
          doc.text(String(participant.lastName ?? ''), margin + colAvatarW + 8, cursorY + 20, {
            width: colLastW - 16,
            ellipsis: true,
          });
          doc.text(String(participant.firstName ?? ''), margin + colAvatarW + colLastW + 8, cursorY + 20, {
            width: colFirstW - 16,
            ellipsis: true,
          });
          doc.text(String(participant.email ?? ''), margin + colAvatarW + colLastW + colFirstW + 8, cursorY + 20, {
            width: colEmailW - 16,
            ellipsis: true,
          });

          cursorY += rowH;
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async verifyTicket(reservationId: string, signature?: string) {
    if (!signature) {
      throw new BadRequestException('Missing ticket signature');
    }

    const expected = this.signTicket(reservationId);
    if (signature !== expected) {
      throw new BadRequestException('Invalid ticket signature');
    }

    const reservation = (await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { user: true, event: true },
    })) as any;

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

