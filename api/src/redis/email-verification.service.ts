import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

@Injectable()
export class EmailVerificationService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly mailService: MailService,
  ) {}

  async sendVerificationCode(email: string): Promise<{ message: string }> {
    // Générer un code de vérification à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Stocker le code dans Redis avec une expiration de 10 minutes
    const key = `email_verification:${email}`;
    await this.redis.setex(key, 600, verificationCode);
    
    // Envoyer l'email avec le code
    await this.mailService.sendMail(
      email,
      'Code de vérification',
      `Votre code de vérification est: ${verificationCode}. Ce code expire dans 10 minutes.`
    );

    return { message: 'Code de vérification envoyé par email' };
  }

  async verifyCode(email: string, code: string): Promise<{ message: string }> {
    const key = `email_verification:${email}`;
    const storedCode = await this.redis.get(key);

    if (!storedCode || storedCode !== code) {
      throw new BadRequestException('Code de vérification invalide ou expiré');
    }

    // Supprimer le code après vérification réussie
    await this.redis.del(key);
    
    // Marquer l'email comme vérifié
    const verifiedKey = `email_verified:${email}`;
    await this.redis.setex(verifiedKey, 86400, 'true'); // 24 heures

    return { message: 'Email vérifié avec succès' };
  }

  async isEmailVerified(email: string): Promise<boolean> {
    const verifiedKey = `email_verified:${email}`;
    const isVerified = await this.redis.get(verifiedKey);
    return isVerified === 'true';
  }

  async sendPasswordResetCode(email: string): Promise<{ message: string }> {
    // Générer un code de réinitialisation à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Stocker le code dans Redis avec une expiration de 15 minutes
    const key = `password_reset:${email}`;
    await this.redis.setex(key, 900, resetCode);
    
    // Envoyer l'email avec le code
    await this.mailService.sendMail(
      email,
      'Code de réinitialisation de mot de passe',
      `Votre code de réinitialisation est: ${resetCode}. Ce code expire dans 15 minutes.`
    );

    return { message: 'Code de réinitialisation envoyé par email' };
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<boolean> {
    const key = `password_reset:${email}`;
    const storedCode = await this.redis.get(key);

    if (!storedCode || storedCode !== code) {
      return false;
    }

    // Ne pas supprimer le code ici, il sera supprimé après la réinitialisation du mot de passe
    return true;
  }

  async deletePasswordResetCode(email: string): Promise<void> {
    const key = `password_reset:${email}`;
    await this.redis.del(key);
  }
}