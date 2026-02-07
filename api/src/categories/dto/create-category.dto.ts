import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Please enter a category name' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Please enter a category description' })
  description: string;
}
