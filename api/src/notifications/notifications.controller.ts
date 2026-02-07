import { Controller, Get, Patch, Post, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  list(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const parsedLimit = limit ? Number(limit) : undefined;
    const parsedBefore = before ? new Date(before) : undefined;
    const parsedUnreadOnly = unreadOnly === 'true';

    return this.notificationsService.listForUser(req.user.id, {
      limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
      before: parsedBefore && !isNaN(parsedBefore.getTime()) ? parsedBefore : undefined,
      unreadOnly: parsedUnreadOnly,
    });
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markRead(req.user.id, id);
  }

  @Post('read-all')
  markAllRead(@Request() req) {
    return this.notificationsService.markAllRead(req.user.id);
  }

  @Get('unread-count')
  async unreadCount(@Request() req) {
    const count = await this.notificationsService.countUnread(req.user.id);
    return { count };
  }
}
