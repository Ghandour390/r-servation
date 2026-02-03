import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';
import { EventRepository } from '../events/event.repository';
import { Reservation, ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationService {
  constructor(
    private reservationRepository: ReservationRepository,
    private eventRepository: EventRepository
  ) {}

  async create(userId: string, eventId: string): Promise<Reservation> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException('Event not found');
    if (event.remainingPlaces <= 0) throw new BadRequestException('No places available');

    const existing = await this.reservationRepository.findByUserAndEvent(userId, eventId);
    if (existing) throw new BadRequestException('Already reserved');

    const reservation = await this.reservationRepository.create({
      user: { connect: { id: userId } },
      event: { connect: { id: eventId } }
    });

    await this.eventRepository.updateRemainingPlaces(eventId, event.remainingPlaces - 1);
    return reservation;
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationRepository.findMany({
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
    return this.reservationRepository.updateStatus(id, status);
  }

  async cancel(id: string, userId: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.userId !== userId) throw new ForbiddenException('Not authorized');
    
    const event = await this.eventRepository.findById(reservation.eventId);
    const updated = await this.reservationRepository.updateStatus(id, 'CANCELED' as ReservationStatus);
    await this.eventRepository.updateRemainingPlaces(reservation.eventId, event.remainingPlaces + 1);
    return updated;
  }
}