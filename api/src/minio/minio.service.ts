import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.getOrThrow<string>('MINIO_ENDPOINT'),
      port: this.configService.get<number>('MINIO_PORT'),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
    });
    this.bucketName = this.configService.getOrThrow<string>('MINIO_BUCKET_NAME');
  }

  async onModuleInit() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        this.logger.log(`Creating bucket: ${this.bucketName}`);
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      } else {
        this.logger.log(`Bucket already exists: ${this.bucketName}`);
      }
    } catch (error) {
      this.logger.error(`Failed to connect to MinIO or check bucket: ${error.message}`);
    }
  }

  async uploadTicket(fileName: string, fileBuffer: Buffer): Promise<string> {
    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      fileBuffer,
      fileBuffer.length,
      { 'Content-Type': 'application/pdf' },
    );
    return await this.minioClient.presignedGetObject(this.bucketName, fileName, 24 * 60 * 60); // 24h expiry
  }

  async uploadAvatar(fileName: string, fileBuffer: Buffer): Promise<string> {
    await this.minioClient.putObject(this.bucketName, fileName, fileBuffer);
    return await this.minioClient.presignedGetObject(this.bucketName, fileName, 7 * 24 * 60 * 60); // 7 days expiry
  }

  async getAvatarUrl(fileName: string): Promise<string> {
    return await this.minioClient.presignedGetObject(this.bucketName, fileName, 7 * 24 * 60 * 60);
  }

  async getTicketUrl(fileName: string): Promise<string> {
    return await this.minioClient.presignedGetObject(this.bucketName, fileName, 24 * 60 * 60);
  }

  async getObjectUrl(fileName: string, expirySeconds: number): Promise<string> {
    return await this.minioClient.presignedGetObject(this.bucketName, fileName, expirySeconds);
  }

  async getObjectDownloadUrl(
    fileName: string,
    expirySeconds: number,
    downloadFileName: string,
    contentType = 'application/octet-stream',
  ): Promise<string> {
    const safeName = downloadFileName.replace(/"/g, "'");
    return await this.minioClient.presignedGetObject(this.bucketName, fileName, expirySeconds, {
      'response-content-disposition': `attachment; filename="${safeName}"`,
      'response-content-type': contentType,
      'response-cache-control': 'no-store',
    });
  }

  extractObjectKeyFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      const path = decodeURIComponent(parsed.pathname);
      const prefix = `/${this.bucketName}/`;
      if (path.startsWith(prefix)) {
        return path.slice(prefix.length);
      }
      return null;
    } catch {
      return null;
    }
  }

  async refreshPresignedUrl(url: string, expirySeconds: number): Promise<string> {
    const key = this.extractObjectKeyFromUrl(url);
    if (!key) return url;
    return this.getObjectUrl(key, expirySeconds);
  }

  async deleteTicket(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }
}
