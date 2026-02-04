import { IsString, IsNotEmpty, IsDateString, IsInt, Min, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum EventCategory {
  CONFERENCE = 'CONFERENCE',
  WORKSHOP = 'WORKSHOP',
  SEMINAR = 'SEMINAR',
  MEETING = 'MEETING'
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty( { message: 'Please enter a title' } )
  title: string;

  @IsString({message: 'Please enter a description'})
  @IsNotEmpty()
  description: string;

  @IsDateString()
  dateTime: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsInt({message: 'Max capacity must be an integer'})
  @Min(1)
  maxCapacity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional({message: 'Please enter a category exemple: CONFERENCE, WORKSHOP, SEMINAR, MEETING'})
  @IsEnum(EventCategory)
  category?: EventCategory;
}