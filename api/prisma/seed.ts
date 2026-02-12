import { PrismaClient, Role, EventStatus, ReservationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as Minio from 'minio';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';

const prisma = new PrismaClient();

const participantCount = 40;
const eventCount = 20;
const passwordPlain = 'Password123!';

const defaultEventImageKey = 'events/default-event-1080x1920.jpg';
const defaultEventImageExpirySeconds = 7 * 24 * 60 * 60; 

const categories = [
  { name: 'Conference', description: 'Large-scale events with multiple sessions and speakers.' },
  { name: 'Workshop', description: 'Hands-on sessions focused on learning and practice.' },
  { name: 'Seminar', description: 'Focused talks and discussions around a topic.' },
  { name: 'Meeting', description: 'Smaller gatherings for collaboration and updates.' },
];

const locations = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Tanger',
  'Agadir',
  'Fes',
  'Oujda',
  'Kenitra',
];

const titles = [
  'Tech Summit',
  'AI Workshop',
  'Product Meetup',
  'Design Sprint',
  'Startup Pitch',
  'Cloud Conference',
  'Cybersecurity Forum',
  'Data Science Day',
  'DevOps Bootcamp',
  'Entrepreneurship Talk',
];

function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value.trim();
}

function getEnvNumber(name: string, fallback?: number): number {
  const raw = process.env[name];
  if (!raw || !raw.trim()) {
    if (fallback === undefined) throw new Error(`Missing required env var: ${name}`);
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid number for env var ${name}: ${raw}`);
  return parsed;
}

function envBool(name: string, fallback = false): boolean {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw === 'true' || raw === '1' || raw.toLowerCase() === 'yes';
}

async function ensureDefaultEventImageUrl(): Promise<string> {
  const endPoint = getEnvOrThrow('MINIO_ENDPOINT').replace(/^https?:\/\//, '');
  const port = getEnvNumber('MINIO_PORT');
  const useSSL = envBool('MINIO_USE_SSL', false);
  const accessKey = getEnvOrThrow('MINIO_ACCESS_KEY');
  const secretKey = getEnvOrThrow('MINIO_SECRET_KEY');
  const region = process.env.MINIO_REGION?.trim() || 'us-east-1';
  const bucketName = getEnvOrThrow('MINIO_BUCKET_NAME');

  const minioClient = new Minio.Client({
    endPoint,
    port,
    useSSL,
    accessKey,
    secretKey,
    region,
  });

  const publicEndPoint = (process.env.MINIO_PUBLIC_ENDPOINT || endPoint).replace(/^https?:\/\//, '');
  const publicPort = getEnvNumber('MINIO_PUBLIC_PORT', port);
  const publicUseSSL = envBool('MINIO_PUBLIC_USE_SSL', useSSL);

  const publicMinioClient = new Minio.Client({
    endPoint: publicEndPoint,
    port: publicPort,
    useSSL: publicUseSSL,
    accessKey,
    secretKey,
    region,
  });

  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName, region);
  }

  let exists = true;
  try {
    await minioClient.statObject(bucketName, defaultEventImageKey);
  } catch {
    exists = false;
  }

  if (!exists) {
    const width = 1080;
    const height = 1920;

    let jpgBuffer: Buffer | null = null;
    try {
      const assetPath = path.resolve(__dirname, '..', 'assets', 'event.avif');
      const avif = await readFile(assetPath);
      jpgBuffer = await sharp(avif)
        .resize(width, height, { fit: 'cover', position: 'attention' })
        .modulate({ saturation: 1.1, brightness: 1.03 })
        .jpeg({ quality: 86, mozjpeg: true })
        .toBuffer();
    } catch {
      // Fallback: abstract, photo-like background (no text).
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#070a12"/>
              <stop offset="1" stop-color="#101d35"/>
            </linearGradient>
            <radialGradient id="light1" cx="25%" cy="25%" r="60%">
              <stop offset="0" stop-color="#7c3aed" stop-opacity="0.55"/>
              <stop offset="1" stop-color="#7c3aed" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="light2" cx="80%" cy="35%" r="70%">
              <stop offset="0" stop-color="#06b6d4" stop-opacity="0.45"/>
              <stop offset="1" stop-color="#06b6d4" stop-opacity="0"/>
            </radialGradient>
            <filter id="blur40"><feGaussianBlur stdDeviation="40"/></filter>
            <filter id="blur80"><feGaussianBlur stdDeviation="80"/></filter>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#bg)"/>
          <g filter="url(#blur80)">
            <ellipse cx="260" cy="420" rx="420" ry="420" fill="url(#light1)"/>
            <ellipse cx="860" cy="520" rx="520" ry="520" fill="url(#light2)"/>
          </g>
          <g opacity="0.18" filter="url(#blur40)">
            <circle cx="220" cy="980" r="140" fill="#ffffff"/>
            <circle cx="540" cy="1120" r="220" fill="#ffffff"/>
            <circle cx="880" cy="980" r="160" fill="#ffffff"/>
          </g>
          <rect x="0" y="0" width="${width}" height="${height}" fill="#000" opacity="0.12"/>
        </svg>
      `;

      jpgBuffer = await sharp(Buffer.from(svg))
        .resize(width, height)
        .jpeg({ quality: 86, mozjpeg: true })
        .toBuffer();
    }

    await minioClient.putObject(
      bucketName,
      defaultEventImageKey,
      jpgBuffer,
      jpgBuffer.length,
      {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    );
  }

  return publicMinioClient.presignedGetObject(bucketName, defaultEventImageKey, defaultEventImageExpirySeconds);
}

async function main() {
  console.log('Start seeding ...');

  const defaultEventImageUrl = await ensureDefaultEventImageUrl();

  await prisma.reservation.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash(passwordPlain, 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@reservation.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  const participants = await Promise.all(
    Array.from({ length: participantCount }).map((_, index) =>
      prisma.user.create({
        data: {
          email: `participant${index + 1}@reservation.com`,
          password: hashedPassword,
          firstName: `User${index + 1}`,
          lastName: 'Participant',
          role: Role.PARTICIPANT,
          isEmailVerified: true,
        },
      })
    )
  );

  const createdCategories = await Promise.all(
    categories.map((category) => prisma.category.create({ data: category }))
  );

  const now = new Date();
  const events = await Promise.all(
    Array.from({ length: eventCount }).map((_, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() + (index + 1) * 2);
      const status =
        index % 10 === 0
          ? EventStatus.CANCELED
          : index % 3 === 0
            ? EventStatus.DRAFT
            : EventStatus.PUBLISHED;
      const maxCapacity = 20 + (index % 5) * 10;
      const category = createdCategories[index % createdCategories.length];
      return prisma.event.create({
        data: {
          title: `${titles[index % titles.length]} ${2026 + (index % 2)}`,
          description: 'Event description for testing.',
          dateTime: date,
          location: locations[index % locations.length],
          maxCapacity,
          remainingPlaces: maxCapacity,
          status,
          imageUrl: defaultEventImageUrl,
          category: { connect: { id: category.id } },
          manager: { connect: { id: admin.id } },
        },
      });
    })
  );

  const reservationsToCreate: {
    userId: string;
    eventId: string;
    status: ReservationStatus;
  }[] = [];

  const eventReservationCounts: Record<string, number> = {};

  events.forEach((event, index) => {
    if (event.status !== EventStatus.PUBLISHED) return;
    const take = 5 + (index % 10);
    const startIndex = index % participants.length;
    for (let i = 0; i < take; i++) {
      const participant = participants[(startIndex + i) % participants.length];
      const status =
        i % 5 === 0
          ? ReservationStatus.CANCELED
          : i % 4 === 0
            ? ReservationStatus.REFUSED
            : i % 3 === 0
              ? ReservationStatus.PENDING
              : ReservationStatus.CONFIRMED;
      reservationsToCreate.push({
        userId: participant.id,
        eventId: event.id,
        status,
      });
      if (status === ReservationStatus.CONFIRMED || status === ReservationStatus.PENDING) {
        eventReservationCounts[event.id] = (eventReservationCounts[event.id] || 0) + 1;
      }
    }
  });

  await prisma.reservation.createMany({
    data: reservationsToCreate,
    skipDuplicates: true,
  });

  await Promise.all(
    events.map((event) =>
      prisma.event.update({
        where: { id: event.id },
        data: {
          remainingPlaces: Math.max(
            0,
            event.maxCapacity - (eventReservationCounts[event.id] || 0)
          ),
        },
      })
    )
  );

  console.log(`Admin: ${admin.email}`);
  console.log(`Participants: ${participants.length}`);
  console.log(`Events: ${events.length}`);
  console.log(`Categories: ${createdCategories.length}`);
  console.log(`Reservations: ${reservationsToCreate.length}`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
