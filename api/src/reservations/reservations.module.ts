import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';
import { MinioModule } from '../minio/minio.module';
import { TicketsModule } from '../tickets/tickets.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReservationRepository } from './reservation.repository';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

@Module({
  imports: [PrismaModule, EventsModule, MinioModule, TicketsModule, MailModule, NotificationsModule],
  providers: [ReservationRepository, ReservationService],
  controllers: [ReservationController],
  exports: [ReservationRepository, ReservationService],
})
export class ReservationsModule {}
