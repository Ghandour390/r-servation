import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './user.repository';
import { EmailVerificationService } from '../redis/email-verification.service';
import * as bcrypt from 'bcryptjs';
import { User, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private emailVerificationService: EmailVerificationService,
  ) {}

  async register(email: string, password: string, firstName: string, lastName: string, role: Role = Role.PARTICIPANT) {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isEmailVerified: false,
    });

    await this.emailVerificationService.sendVerificationCode(email);

    const { password: _, ...result } = user;
    return {
      user: result,
      message: 'Utilisateur créé. Veuillez vérifier votre email.',
    };
  }

  async verifyEmail(email: string, code: string) {
    const result = await this.emailVerificationService.verifyCode(email, code);
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    await this.userRepository.update(user.id, { isEmailVerified: true });

    return result;
  }

  async resendVerificationCode(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email déjà vérifié');
    }

    return this.emailVerificationService.sendVerificationCode(email);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Veuillez vérifier votre email avant de vous connecter');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    return this.emailVerificationService.sendPasswordResetCode(email);
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const isValidCode = await this.emailVerificationService.verifyPasswordResetCode(email, code);
    
    if (!isValidCode) {
      throw new BadRequestException('Code de réinitialisation invalide ou expiré');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    await this.userRepository.update(user.id, { password: hashedPassword });

    await this.emailVerificationService.deletePasswordResetCode(email);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }
}