import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, ReservationStatus } from '@prisma/client';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Post(':eventId')
  create(@Param('eventId') eventId: string, @Request() req) {
    return this.reservationService.create(req.user.sub, eventId);
  }

  @Get()
  @UseGuards(RolesGuard)

  findAll() {
    return this.reservationService.findAll();
  }

  @Get('my')
  findMy(@Request() req) {
    return this.reservationService.findByUser(req.user.sub);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reservationService.findById(id);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() { status }: { status: ReservationStatus }, @Request() req) {
    return this.reservationService.updateStatus(id, status, req.user.sub);
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string, @Request() req) {
    return this.reservationService.cancel(id, req.user.sub);
  }
}