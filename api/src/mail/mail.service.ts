import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private isConfigured: boolean;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    this.isConfigured = Boolean(host && port && user && pass);

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        auth: {
          user,
          pass,
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      console.warn('MailService: MAIL_* configuration missing. Emails will be logged only.');
    }
  }

  async sendMail(to: string, subject: string, body: string) {
    const from = this.configService.get<string>('MAIL_FROM') ?? 'no-reply@example.com';
    return this.transporter.sendMail({
      from,
      to,
      subject,
      text: body,
    });
  }

  async sendReservationConfirmation(to: string, eventTitle: string, ticketUrl?: string) {
    const mailOptions = {
      from: this.configService.getOrThrow<string>('MAIL_FROM'),
      to,
      subject: `Confirmation de réservation - ${eventTitle}`,
      html: `
        <h2>Confirmation de réservation</h2>
        <p>Votre réservation pour l'événement <strong>${eventTitle}</strong> a été confirmée.</p>
        ${ticketUrl ? `<p><a href="${ticketUrl}">Télécharger votre billet</a></p>` : ''}
        <p>Merci de votre confiance !</p>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendReservationCancellation(to: string, eventTitle: string) {
    const mailOptions = {
      from: this.configService.getOrThrow<string>('MAIL_FROM'),
      to,
      subject: `Annulation de réservation - ${eventTitle}`,
      html: `
        <h2>Annulation de réservation</h2>
        <p>Votre réservation pour l'événement <strong>${eventTitle}</strong> a été annulée.</p>
        <p>Nous espérons vous revoir bientôt !</p>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }
}