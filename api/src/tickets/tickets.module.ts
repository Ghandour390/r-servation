import { Module } from '@nestjs/common';
import { ReservationsModule } from '../reservations/reservations.module';
import { TicketsController } from './tickets.controller';

@Module({
  imports: [ReservationsModule],
  controllers: [TicketsController],
})
export class TicketsModule {}

