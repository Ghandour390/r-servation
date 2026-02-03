import { Injectable } from '@nestjs/common';
import { Reservation, Prisma, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface IReservationRepository {
  create(data: Prisma.ReservationCreateInput): Promise<Reservation>;
  findById(id: string): Promise<Reservation | null>;
  update(id: string, data: Prisma.ReservationUpdateInput): Promise<Reservation>;
  delete(id: string): Promise<Reservation>;
  findMany(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.ReservationWhereInput;
    orderBy?: Prisma.ReservationOrderByWithRelationInput;
    include?: Prisma.ReservationInclude;
  }): Promise<Reservation[]>;
  findByUserId(userId: string): Promise<Reservation[]>;
  findByEventId(eventId: string): Promise<Reservation[]>;
  findByUserAndEvent(userId: string, eventId: string): Promise<Reservation | null>;
  updateStatus(id: string, status: ReservationStatus): Promise<Reservation>;
  countByEventId(eventId: string): Promise<number>;
  findByStatus(status: ReservationStatus): Promise<Reservation[]>;
}

@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ReservationCreateInput): Promise<Reservation> {
    return this.prisma.reservation.create({ data });
  }

  async findById(id: string): Promise<Reservation | null> {
    return this.prisma.reservation.findUnique({ 
      where: { id },
      include: { user: true, event: true }
    });
  }

  async update(id: string, data: Prisma.ReservationUpdateInput): Promise<Reservation> {
    return this.prisma.reservation.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Reservation> {
    return this.prisma.reservation.delete({ where: { id } });
  }

  async findMany(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.ReservationWhereInput;
    orderBy?: Prisma.ReservationOrderByWithRelationInput;
    include?: Prisma.ReservationInclude;
  }): Promise<Reservation[]> {
    return this.prisma.reservation.findMany(params);
  }

  async findByUserId(userId: string): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { event: true }
    });
  }

  async findByEventId(eventId: string): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      where: { eventId },
      include: { user: true }
    });
  }

  async findByUserAndEvent(userId: string, eventId: string): Promise<Reservation | null> {
    return this.prisma.reservation.findUnique({
      where: { userId_eventId: { userId, eventId } },
      include: { user: true, event: true }
    });
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    return this.prisma.reservation.update({
      where: { id },
      data: { status }
    });
  }

  async countByEventId(eventId: string): Promise<number> {
    return this.prisma.reservation.count({
      where: { 
        eventId,
        status: { in: ['CONFIRMED', 'PENDING'] }
      }
    });
  }

  async findByStatus(status: ReservationStatus): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      where: { status },
      include: { user: true, event: true }
    });
  }
}