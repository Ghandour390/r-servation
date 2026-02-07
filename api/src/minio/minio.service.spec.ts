import { ConfigService } from '@nestjs/config';
import { MinioService } from './minio.service';

describe('MinioService', () => {
  it('builds a download url with Content-Disposition headers', async () => {
    const config = {
      getOrThrow: (key: string) => {
        const map: Record<string, any> = {
          MINIO_ENDPOINT: 'localhost',
          MINIO_ACCESS_KEY: 'minioadmin',
          MINIO_SECRET_KEY: 'minioadmin',
          MINIO_BUCKET_NAME: 'event-tickets',
        };
        if (!(key in map)) throw new Error(`missing ${key}`);
        return map[key];
      },
      get: (key: string) => {
        if (key === 'MINIO_PORT') return 9000;
        if (key === 'MINIO_USE_SSL') return 'false';
        return undefined;
      },
    } as unknown as ConfigService;

    const service = new MinioService(config);
    (service as any).minioClient = {
      presignedGetObject: jest.fn(async () => 'http://minio/presigned'),
      bucketExists: jest.fn(async () => true),
    };

    const url = await service.getObjectDownloadUrl('tickets/x.pdf', 60, 'myfile.pdf', 'application/pdf');

    expect(url).toBe('http://minio/presigned');
    expect((service as any).minioClient.presignedGetObject).toHaveBeenCalledWith(
      'event-tickets',
      'tickets/x.pdf',
      60,
      expect.objectContaining({
        'response-content-disposition': expect.stringContaining('attachment'),
        'response-content-type': 'application/pdf',
      }),
    );
  });
});

