import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReservationService } from '../reservations/reservation.service';

@Controller('tickets')
export class TicketsController {
  constructor(private reservationService: ReservationService) {}

  @Get('verify/:reservationId')
  verify(
    @Param('reservationId') reservationId: string,
    @Query('sig') sig?: string,
  ) {
    return this.reservationService.verifyTicket(reservationId, sig);
  }
}

