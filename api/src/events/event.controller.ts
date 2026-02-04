import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, BadRequestException, ValidationPipe } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventController {
  constructor(private eventService: EventService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body(ValidationPipe) data: CreateEventDto, @Request() req) {
    try {
      return this.eventService.create({
        ...data,
        dateTime: new Date(data.dateTime),
        maxCapacity: Number(data.maxCapacity),
        price: data.price ? Number(data.price) : 0,
        title: data.title,
        description: data.description,
        location: data.location,
        category: data.category,
        managerId: req.user.id,
      });
    } catch (error) {
      console.error('Create event error:', error);
      throw new BadRequestException(error.message);
    }
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body(ValidationPipe) data: UpdateEventDto, @Request() req) {
    const updateData: any = { ...data };
    if (data.dateTime) updateData.dateTime = new Date(data.dateTime);
    if (data.maxCapacity) updateData.maxCapacity = Number(data.maxCapacity);
    if (data.price) updateData.price = Number(data.price);

    return this.eventService.update(id, updateData, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  delete(@Param('id') id: string, @Request() req) {
    return this.eventService.delete(id, req.user.id);
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  publish(@Param('id') id: string, @Request() req) {
    return this.eventService.publish(id, req.user.id);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  cancel(@Param('id') id: string, @Request() req) {
    return this.eventService.cancel(id, req.user.id);
  }
}