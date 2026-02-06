import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MinioModule } from '../minio/minio.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
    imports: [PrismaModule, MinioModule, TicketsModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
