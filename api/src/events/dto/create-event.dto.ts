import { IsString, IsNotEmpty, IsDateString, IsInt, Min, IsNumber, IsOptional } from 'class-validator';

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

  @IsOptional()
  @IsString()
  categoryId?: string;
}
