import { PrismaClient, Role, EventStatus, ReservationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Nettoyage de la base de données (ordre important à cause des clés étrangères)
  await prisma.reservation.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Création de l'Admin
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
  console.log(`Created admin: ${admin.email}`);

  // 2. Création d'un Participant
  const participant = await prisma.user.create({
    data: {
      email: 'user@reservation.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.PARTICIPANT,
      isEmailVerified: true,
    },
  });
  console.log(`Created participant: ${participant.email}`);

  // 3. Création d'Événements (gérés par l'admin)
  const event1 = await prisma.event.create({
    data: {
      title: 'Conférence Tech 2024',
      description: 'Une conférence sur les dernières innovations technologiques.',
      dateTime: new Date('2024-12-15T09:00:00Z'),
      location: 'Paris, Le Grand Rex',
      maxCapacity: 100,
      remainingPlaces: 99, // Une place sera prise par la réservation ci-dessous
      status: EventStatus.PUBLISHED,
      managerId: admin.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Atelier Cuisine Italienne',
      description: 'Apprenez à faire des pâtes fraîches.',
      dateTime: new Date('2024-11-20T18:00:00Z'),
      location: 'Lyon',
      maxCapacity: 20,
      remainingPlaces: 20,
      status: EventStatus.DRAFT,
      managerId: admin.id,
    },
  });
  console.log(`Created events: ${event1.title}, ${event2.title}`);

  // 4. Création d'une Réservation
  const reservation = await prisma.reservation.create({
    data: {
      userId: participant.id,
      eventId: event1.id,
      status: ReservationStatus.CONFIRMED,
    },
  });
  console.log(`Created reservation for user ${participant.email} on event ${event1.title}`);

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