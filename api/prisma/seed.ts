import { PrismaClient, Role, EventStatus, ReservationStatus, EventCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const participantCount = 40;
const eventCount = 20;
const passwordPlain = 'Password123!';

const categories = [
  EventCategory.CONFERENCE,
  EventCategory.WORKSHOP,
  EventCategory.SEMINAR,
  EventCategory.MEETING,
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

async function main() {
  console.log('Start seeding ...');

  await prisma.reservation.deleteMany();
  await prisma.event.deleteMany();
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
      return prisma.event.create({
        data: {
          title: `${titles[index % titles.length]} ${2026 + (index % 2)}`,
          description: 'Event description for testing.',
          dateTime: date,
          location: locations[index % locations.length],
          maxCapacity,
          remainingPlaces: maxCapacity,
          status,
          category: categories[index % categories.length],
          managerId: admin.id,
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
