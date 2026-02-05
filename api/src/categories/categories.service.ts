import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoriesService {
  constructor(private categoryRepository: CategoryRepository) { }

  async create(data: { name: string; description: string }): Promise<Category> {
    try {
      return await this.categoryRepository.create({
        name: data.name,
        description: data.description,
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException('Category name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) throw new NotFoundException('Category not found');

    try {
      return await this.categoryRepository.update(id, data as Prisma.CategoryUpdateInput);
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException('Category name already exists');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<Category> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) throw new NotFoundException('Category not found');
    try {
      return await this.categoryRepository.delete(id);
    } catch (error: any) {
      if (error?.code === 'P2003') {
        throw new BadRequestException('Category is linked to existing events');
      }
      throw error;
    }
  }
}
