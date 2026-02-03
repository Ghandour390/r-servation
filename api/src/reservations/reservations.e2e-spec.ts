import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Reservations E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let eventId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Create user and event
    const user = await prisma.user.create({
      data: {
        email: 'user@test.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'PARTICIPANT',
        isEmailVerified: true,
      },
    });

    const event = await prisma.event.create({
      data: {
        title: 'Test Event',
        description: 'Test Description',
        dateTime: new Date(),
        location: 'Test Location',
        maxCapacity: 100,
        remainingPlaces: 100,
        managerId: user.id,
      },
    });

    eventId = event.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@test.com', password: 'password' });
    
    userToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('/reservations/:eventId (POST)', async () => {
    return request(app.getHttpServer())
      .post(`/reservations/${eventId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201)
      .expect((res) => {
        expect(res.body.eventId).toBe(eventId);
      });
  });

  it('/reservations/my (GET)', async () => {
    return request(app.getHttpServer())
      .get('/reservations/my')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});