import { Injectable } from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface IEventRepository {
  create(data: Prisma.EventCreateInput): Promise<Event>;
  findById(id: string): Promise<Event | null>;
  update(id: string, data: Prisma.EventUpdateInput): Promise<Event>;
  delete(id: string): Promise<Event>;
  findMany(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
    include?: Prisma.EventInclude;
  }): Promise<Event[]>;
  findByManagerId(managerId: string): Promise<Event[]>;
  updateRemainingPlaces(id: string, places: number): Promise<Event>;
}

@Injectable()
export class EventRepository implements IEventRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.EventCreateInput): Promise<Event> {
    return this.prisma.event.create({ data });
  }

  async findById(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({ 
      where: { id },
      include: { manager: true, reservations: true }
    });
  }

  async update(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    return this.prisma.event.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Event> {
    return this.prisma.event.delete({ where: { id } });
  }

  async findMany(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
    include?: Prisma.EventInclude;
  }): Promise<Event[]> {
    return this.prisma.event.findMany(params);
  }

  async findByManagerId(managerId: string): Promise<Event[]> {
    return this.prisma.event.findMany({
      where: { managerId },
      include: { reservations: true }
    });
  }

  async updateRemainingPlaces(id: string, places: number): Promise<Event> {
    return this.prisma.event.update({
      where: { id },
      data: { remainingPlaces: places }
    });
  }
}