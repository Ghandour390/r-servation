import { IsEmail, IsString, MinLength, IsOptional, Matches, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and number or special character',
  })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'PARTICIPANT', enum: ['ADMIN', 'PARTICIPANT'], required: false })
  @IsOptional()
  @IsEnum(['ADMIN', 'PARTICIPANT'])
  role?: Role;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string; 
  
  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;
  
  @ApiProperty({ example: 'NewPassword123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and number or special character',
  })
  newPassword: string;
} 

export class VerificationCodeDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'uuid-refresh-token' })
  @IsString()
  refresh_token: string;
}

export class LogoutDto {
  @ApiProperty({ example: 'uuid-refresh-token', required: false })
  @IsOptional()
  @IsString()
  refresh_token?: string;
}