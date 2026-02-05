import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';
import { MinioModule } from '../minio/minio.module';
import { ReservationRepository } from './reservation.repository';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

@Module({
  imports: [PrismaModule, EventsModule, MinioModule],
  providers: [ReservationRepository, ReservationService],
  controllers: [ReservationController],
  exports: [ReservationRepository, ReservationService],
})
export class ReservationsModule {}
