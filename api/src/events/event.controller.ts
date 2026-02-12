import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, BadRequestException, ValidationPipe, UseInterceptors, UploadedFile, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from '../minio/minio.service';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(
    private eventService: EventService,
    private minioService: MinioService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body(ValidationPipe) data: CreateEventDto,
    @UploadedFile() file: any,
    @Request() req
  ) {
    try {
      let imageUrl: string | undefined;

      if (file) {
        this.logger.log(`Uploading event image: ${file.originalname}`);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const fileName = `events/${req.user.id}-${Date.now()}-${sanitizedName}`;
        imageUrl = await this.minioService.uploadAvatar(fileName, file.buffer);
      }

      const categoryId = data.categoryId?.trim() ? data.categoryId : undefined;

      return this.eventService.create({
        ...data,
        dateTime: new Date(data.dateTime),
        maxCapacity: Number(data.maxCapacity),
        price: data.price ? Number(data.price) : 0,
        title: data.title,
        description: data.description,
        location: data.location,
        categoryId,
        managerId: req.user.id,
        imageUrl,
      });
    } catch (error) {
      this.logger.error('Create event error:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  findAll(@Request() req, @Query('search') search?: string, @Query('category') category?: string) {
    const userRole = req.user?.role;
    return this.eventService.findAll(userRole, { search, category });
  }

  @Get(':id')
  findById(@Param('id') id: string, @Request() req) {
    const userRole = req.user?.role;
    return this.eventService.findById(id, userRole);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) data: UpdateEventDto,
    @UploadedFile() file: any,
    @Request() req
  ) {
    const updateData: any = { ...data };
    if (data.dateTime) updateData.dateTime = new Date(data.dateTime);
    if (data.maxCapacity) updateData.maxCapacity = Number(data.maxCapacity);
    if (data.price) updateData.price = Number(data.price);
    if (data.categoryId !== undefined) {
      if (data.categoryId && data.categoryId.trim()) {
        updateData.category = { connect: { id: data.categoryId } };
      } else {
        updateData.category = { disconnect: true };
      }
      delete updateData.categoryId;
    }

    if (file) {
      this.logger.log(`Uploading updated event image: ${file.originalname}`);
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `events/${req.user.id}-${Date.now()}-${sanitizedName}`;
      updateData.imageUrl = await this.minioService.uploadAvatar(fileName, file.buffer);
    }

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
