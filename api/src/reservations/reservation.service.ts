import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';
import { EventRepository } from '../events/event.repository';
import { Reservation, ReservationStatus, Prisma, EventCategory } from '@prisma/client';

@Injectable()
export class ReservationService {
  constructor(
    private reservationRepository: ReservationRepository,
    private eventRepository: EventRepository
  ) { }

  async create(userId: string, eventId: string): Promise<Reservation> {
    const event = await this.eventRepository.findById(eventId, {
      include: { reservations: true }
    }) as any;
    if (!event) throw new NotFoundException('Event not found');
    if (event.status !== 'PUBLISHED') throw new BadRequestException('Event is not published');
    if (event.reservations.length >= event.maxCapacity) throw new BadRequestException('No places available');

    const existing = await this.reservationRepository.findByUserAndEvent(userId, eventId);
    if (existing) throw new BadRequestException('Already reserved');


    const reservation = await this.reservationRepository.create({
      user: { connect: { id: userId } },
      event: { connect: { id: eventId } }
    });

    // Do NOT update remainingPlaces here anymore. 
    // It should only decrease when confirmed.
    return reservation;
  }

  async findAll(filters?: { search?: string; category?: EventCategory }): Promise<Reservation[]> {
    const where: Prisma.ReservationWhereInput = {};

    if (filters?.category) {
      where.event = { category: filters.category };
    }

    if (filters?.search) {
      where.OR = [
        { event: { title: { contains: filters.search, mode: 'insensitive' } } },
        { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return this.reservationRepository.findMany({
      where,
      include: { user: true, event: true }
    });
  }

  async findById(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async findByUser(userId: string): Promise<Reservation[]> {
    return this.reservationRepository.findByUserId(userId);
  }

  async updateStatus(id: string, status: ReservationStatus, userId: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id) as any;
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.event.managerId !== userId) throw new ForbiddenException('Not authorized');

    const previousStatus = reservation.status;
    const updated = await this.reservationRepository.updateStatus(id, status);

    // Capacity Logic: Decrease remainingPlaces ONLY when moving to CONFIRMED
    if (status === 'CONFIRMED' && previousStatus !== 'CONFIRMED') {
      const event = await this.eventRepository.findById(reservation.eventId);
      if (event) {
        await this.eventRepository.updateRemainingPlaces(reservation.eventId, event.remainingPlaces - 1);
      }
    }

    return updated;
  }

  async delete(id: string, userId: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id) as any;
    if (!reservation) throw new NotFoundException('Reservation not found');

    // Check if user is owner or admin (or event manager)
    // For now, let's allow owner to delete (cancel)
    if (reservation.userId !== userId) throw new ForbiddenException('Not authorized');

    // Capacity Logic: If it was CONFIRMED, free up the spot
    if (reservation.status === 'CONFIRMED') {
      const event = await this.eventRepository.findById(reservation.eventId);
      if (event) {
        await this.eventRepository.updateRemainingPlaces(reservation.eventId, event.remainingPlaces + 1);
      }
    }

    return this.reservationRepository.delete(id);
  }

  // Legacy cancel method - updating to use delete logic or retiring if needed
  async cancel(id: string, userId: string): Promise<Reservation> {
    return this.delete(id, userId);
  }
}