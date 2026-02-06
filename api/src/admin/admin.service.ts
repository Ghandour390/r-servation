import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { TicketsService } from '../tickets/tickets.service';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private minioService: MinioService,
        private ticketsService: TicketsService,
    ) { }

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

    async exportEventParticipantsPdf(eventId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                reservations: {
                    where: { status: 'CONFIRMED' },
                    include: { user: true },
                },
            },
        }) as any;

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const refreshedEventImageUrl = event.imageUrl
            ? await this.minioService.refreshPresignedUrl(event.imageUrl, 60 * 60)
            : undefined;

        const participants = await Promise.all(
            (event.reservations || []).map(async (reservation: any) => {
                const avatarUrl = reservation.user?.avatarUrl
                    ? await this.minioService.refreshPresignedUrl(reservation.user.avatarUrl, 60 * 60)
                    : null;
                return {
                    firstName: reservation.user?.firstName,
                    lastName: reservation.user?.lastName,
                    email: reservation.user?.email,
                    avatarUrl,
                };
            }),
        );

        const buffer = await this.ticketsService.buildParticipantsListPdf(event, participants, refreshedEventImageUrl);
        const fileName = this.ticketsService.getParticipantsDownloadFileName(event.title);

        return { buffer, fileName };
    }
}
