import { Controller, Get, UseGuards, StreamableFile, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('stats')
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('events/:eventId/participants/pdf')
    async exportEventParticipants(@Param('eventId') eventId: string) {
        const { buffer, fileName } = await this.adminService.exportEventParticipantsPdf(eventId);
        return new StreamableFile(buffer, {
            type: 'application/pdf',
            disposition: `attachment; filename="${fileName.replace(/"/g, "'")}"`,
        });
    }
}
