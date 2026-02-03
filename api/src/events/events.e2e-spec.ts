import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Events E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Create admin user and get token
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: 'hashedPassword',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isEmailVerified: true,
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });
    
    adminToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('/events (POST)', async () => {
    const eventData = {
      title: 'Test Event',
      description: 'Test Description',
      dateTime: new Date().toISOString(),
      location: 'Test Location',
      maxCapacity: 100,
    };

    return request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(eventData)
      .expect(201)
      .expect((res) => {
        expect(res.body.title).toBe(eventData.title);
      });
  });

  it('/events (GET)', async () => {
    return request(app.getHttpServer())
      .get('/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});