import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ValidationPipe, UseInterceptors, UploadedFile, Logger, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MinioService } from '../minio/minio.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(
        private userService: UserService,
        private minioService: MinioService,
    ) { }

    @Get()
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    findAll() {
        return this.userService.findAll();
    }

    @Get('profile')
    getProfile(@Request() req) {
        return this.userService.findProfile(req.user.id);
    }

    @Put('profile')
    updateProfile(@Body(ValidationPipe) data: UpdateProfileDto, @Request() req) {
        return this.userService.updateProfile(req.user.id, data);
    }

    @Post('avatar')
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 200 * 1024 * 1024 // 200MB
        }
    }))
    async uploadAvatar(@UploadedFile() file: any, @Request() req) {
        if (!file) {
            this.logger.error('No file uploaded');
            throw new BadRequestException('No file uploaded');
        }

        try {
            this.logger.log(`Uploading avatar for user ${req.user.id}: ${file.originalname} (${file.size} bytes)`);
            const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
            const fileName = `avatars/${req.user.id}-${Date.now()}-${sanitizedName}`;
            const url = await this.minioService.uploadAvatar(fileName, file.buffer);
            this.logger.log(`Avatar uploaded successfully: ${url}`);
            return this.userService.updateProfile(req.user.id, { avatarUrl: url });
        } catch (error) {
            this.logger.error(`Failed to upload avatar: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body(ValidationPipe) data: UpdateProfileDto) {
        return this.userService.updateUser(id, data);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.userService.deleteUser(id);
    }
}
