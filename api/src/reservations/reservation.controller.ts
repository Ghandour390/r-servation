import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, ValidationPipe } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReservationStatus } from '@prisma/client';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private reservationService: ReservationService) { }

  @Post(':eventId')
  @UseGuards(RolesGuard)
  @Roles('PARTICIPANT')
  create(@Param('eventId') eventId: string, @Request() req) {
    return this.reservationService.create(req.user.id, eventId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll(@Query('search') search?: string, @Query('category') category?: string) {
    return this.reservationService.findAll({ search, category });
  }

  @Get('my')
  findMy(@Request() req) {
    return this.reservationService.findByUser(req.user.id);
  }

  @Get(':id/ticket')
  getTicket(@Param('id') id: string, @Request() req) {
    return this.reservationService.getTicketUrl(id, req.user);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reservationService.findById(id);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body(ValidationPipe) data: UpdateReservationDto, @Request() req) {
    return this.reservationService.updateStatus(id, data.status, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.reservationService.delete(id, req.user.id);
  }
}
