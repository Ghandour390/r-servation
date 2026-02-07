import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryRepository } from './category.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryRepository],
  exports: [CategoriesService, CategoryRepository],
})
export class CategoriesModule { }
