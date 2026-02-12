import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface ICategoryRepository {
  create(data: Prisma.CategoryCreateInput): Promise<Category>;
  findMany(params?: {
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  }): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>;
  delete(id: string): Promise<Category>;
}

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaService) { }

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  async findMany(params?: {
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  }): Promise<Category[]> {
    return this.prisma.category.findMany(params);
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }
}
