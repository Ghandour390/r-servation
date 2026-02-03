import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { Event, EventStatus } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private eventRepository: EventRepository) {}

  async create(data: {
    title: string;
    description: string;
    dateTime: Date;
    location: string;
    maxCapacity: number;
    managerId: string;
  }): Promise<Event> {
    return this.eventRepository.create({
      ...data,
      remainingPlaces: data.maxCapacity,
      manager: { connect: { id: data.managerId } }
    });
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.findMany({
      include: { manager: true, reservations: true }
    });
  }

  async findById(id: string): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    return event;
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
}