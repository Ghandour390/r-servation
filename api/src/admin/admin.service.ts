import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        console.log('Fetching statistics...');
        const totalEvents = await this.prisma.event.count();
        const publishedEvents = await this.prisma.event.count({ where: { status: 'PUBLISHED' } });
        const draftEvents = await this.prisma.event.count({ where: { status: 'DRAFT' } });
        const cancelledEvents = await this.prisma.event.count({ where: { status: 'CANCELED' } });

        const totalReservations = await this.prisma.reservation.count();
        const confirmedReservations = await this.prisma.reservation.count({ where: { status: 'CONFIRMED' } });
        const pendingReservations = await this.prisma.reservation.count({ where: { status: 'PENDING' } });
        const cancelledReservations = await this.prisma.reservation.count({ where: { status: 'CANCELED' } });

        const totalUsers = await this.prisma.user.count();

        const recentReservations = await this.prisma.reservation.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { firstName: true, lastName: true, email: true } },
                event: { select: { title: true, imageUrl: true } },
            },
        });

        const upcomingEvents = await this.prisma.event.findMany({
            where: {
                status: 'PUBLISHED',
                dateTime: { gt: new Date() },
            },
            take: 5,
            orderBy: { dateTime: 'asc' },
            select: {
                id: true,
                title: true,
                dateTime: true,
                remainingPlaces: true,
                maxCapacity: true,
                imageUrl: true,
            },
        });

        console.log('Stats fetched successfully');

        return {
            totalEvents,
            publishedEvents,
            draftEvents,
            cancelledEvents,
            totalReservations,
            confirmedReservations,
            pendingReservations,
            cancelledReservations,
            totalUsers,
            recentReservations: recentReservations.map((r: any) => ({
                id: r.id,
                userName: `${r.user.firstName} ${r.user.lastName}`,
                eventTitle: r.event.title,
                eventImageUrl: r.event.imageUrl,
                status: r.status,
                createdAt: r.createdAt,
            })),
            upcomingEvents,
        };
    }
}
