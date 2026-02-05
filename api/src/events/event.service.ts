import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { MinioService } from '../minio/minio.service';
import { Event, EventStatus, EventCategory, Prisma } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(
    private eventRepository: EventRepository,
    private minioService: MinioService,
  ) { }

  private async withFreshImageUrl(event: Event): Promise<Event> {
    if (!event.imageUrl) return event;
    const refreshedUrl = await this.minioService.refreshPresignedUrl(
      event.imageUrl,
      7 * 24 * 60 * 60,
    );
    return { ...event, imageUrl: refreshedUrl };
  }

  async create(data: {
    title: string;
    description: string;
    dateTime: Date;
    location: string;
    maxCapacity: number;
    price?: number;
    category?: EventCategory;
    managerId: string;
    imageUrl?: string;
  }): Promise<Event> {
    const { managerId, ...eventData } = data;
    return this.eventRepository.create({
      ...eventData,
      remainingPlaces: data.maxCapacity,
      manager: { connect: { id: managerId } }
    });
  }

  async findAll(userRole?: string, filters?: { search?: string; category?: EventCategory }): Promise<Event[]> {
    const where: Prisma.EventWhereInput = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (userRole === 'ADMIN') {
      const events = await this.eventRepository.findMany({
        where,
        include: {
          manager: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          reservations: {
            include: { user: { select: { firstName: true, lastName: true, email: true } } }
          }
        }
      });
      return Promise.all(events.map((event) => this.withFreshImageUrl(event)));
    }

    where.status = EventStatus.PUBLISHED;
    const events = await this.eventRepository.findMany({
      where,
      include: {
        manager: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        _count: { select: { reservations: true } }
      }
    });
    return Promise.all(events.map((event) => this.withFreshImageUrl(event)));
  }

  async findById(id: string, userRole?: string): Promise<Event> {
    const includeOptions = userRole === 'ADMIN'
      ? {
        manager: { select: { id: true, firstName: true, lastName: true, email: true } },
        reservations: { include: { user: { select: { firstName: true, lastName: true, email: true } } } }
      }
      : {
        manager: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { reservations: true } }
      };

    const event = await this.eventRepository.findById(id, { include: includeOptions });
    if (!event) throw new NotFoundException('Event not found');
    if (userRole !== 'ADMIN' && event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException('Event not found');
    }
    return this.withFreshImageUrl(event);
  }

  async update(id: string, data: Partial<Event>, userId: string): Promise<Event> {
    const event = await this.findById(id);
    if (event.managerId !== userId) throw new ForbiddenException('Not authorized');
    return this.eventRepository.update(id, data);
  }

  async delete(id: string, userId: string): Promise<Event> {
    const event = await this.findById(id);
    if (event.managerId !== userId) throw new ForbiddenException('Not authorized');
    return this.eventRepository.delete(id);
  }

  async publish(id: string, userId: string): Promise<Event> {
    return this.update(id, { status: EventStatus.PUBLISHED }, userId);
  }

  async cancel(id: string, userId: string): Promise<Event> {
    return this.update(id, { status: EventStatus.CANCELED }, userId);
  }
}
