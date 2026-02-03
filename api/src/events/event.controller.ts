import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() data: any, @Request() req) {
    return this.eventService.create({ ...data, managerId: req.user.sub });
  }

  @Get()
  findAll(@Request() req) {
    const userRole = req.user?.role;
    return this.eventService.findAll(userRole);
  }

  @Get(':id')
  findById(@Param('id') id: string, @Request() req) {
    const userRole = req.user?.role;
    return this.eventService.findById(id, userRole);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.eventService.update(id, data, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  delete(@Param('id') id: string, @Request() req) {
    return this.eventService.delete(id, req.user.sub);
  }

  @Put(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  publish(@Param('id') id: string, @Request() req) {
    return this.eventService.publish(id, req.user.sub);
  }
}