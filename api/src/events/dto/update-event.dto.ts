import { IsString, IsOptional, IsDateString, IsInt, Min, IsEnum, IsNumber } from 'class-validator';
import { EventStatus } from '@prisma/client';

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
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
