import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../auth/user.repository';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) { }

    async findAll(): Promise<User[]> {
        return this.userRepository.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findProfile(userId: string): Promise<User> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateProfile(userId: string, data: { firstName?: string; lastName?: string; email?: string; password?: string; avatarUrl?: string }): Promise<User> {
        const updateData: Prisma.UserUpdateInput = { ...data };

        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        return this.userRepository.update(userId, updateData);
    }

    async updateUser(id: string, data: Partial<User>): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) throw new NotFoundException('User not found');

        const updateData: any = { ...data };
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        return this.userRepository.update(id, updateData);
    }

    async deleteUser(id: string): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) throw new NotFoundException('User not found');
        return this.userRepository.delete(id);
    }
}
