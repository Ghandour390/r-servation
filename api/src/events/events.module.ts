import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventRepository } from './event.repository';
import { EventService } from './event.service';
import { EventController } from './event.controller';

@Module({
  imports: [PrismaModule],
  providers: [EventRepository, EventService],
  controllers: [EventController],
  exports: [EventRepository, EventService],
})
export class EventsModule {}