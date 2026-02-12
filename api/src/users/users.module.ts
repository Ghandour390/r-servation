import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { MinioModule } from '../minio/minio.module';

@Module({
    imports: [AuthModule, MinioModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UsersModule { }
