import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ReservationStatus } from '@prisma/client';

export class UpdateReservationDto {
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @IsOptional()
  @IsString()
  ticketUrl?: string;
}