import { Controller, Get, Param, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get('verify/:reservationId')
  verify(
    @Param('reservationId') reservationId: string,
    @Query('sig') sig?: string,
  ) {
    return this.ticketsService.verifyTicket(reservationId, sig);
  }
}
