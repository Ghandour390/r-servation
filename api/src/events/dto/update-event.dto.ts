import { IsString, IsOptional, IsDateString, IsInt, Min, IsEnum, IsNumber } from 'class-validator';
import { EventStatus } from '@prisma/client';
import { EventCategory } from './create-event.dto';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dateTime?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxCapacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}