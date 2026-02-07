import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Notification, NotificationType } from '@prisma/client';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export interface ListNotificationsOptions {
  limit?: number;
  before?: Date;
  unreadOnly?: boolean;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateNotificationInput): Promise<Notification> {
    return this.prisma.notification.create({ data });
  }

  async listForUser(userId: string, options: ListNotificationsOptions = {}) {
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 50);
    const where: any = { userId };

    if (options.unreadOnly) {
      where.isRead = false;
    }
    if (options.before) {
      where.createdAt = { lt: options.before };
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
