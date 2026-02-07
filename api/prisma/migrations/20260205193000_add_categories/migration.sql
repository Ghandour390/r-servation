-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- AlterTable
ALTER TABLE "events" ADD COLUMN "categoryId" TEXT;

-- Seed baseline categories for existing data mapping
INSERT INTO "categories" ("id", "name", "description") VALUES
    ('cat_conference', 'Conference', 'Large-scale events with multiple sessions and speakers.'),
    ('cat_workshop', 'Workshop', 'Hands-on sessions focused on learning and practice.'),
    ('cat_seminar', 'Seminar', 'Focused talks and discussions around a topic.'),
    ('cat_meeting', 'Meeting', 'Smaller gatherings for collaboration and updates.');

-- Map old enum values to new category IDs
UPDATE "events" SET "categoryId" = 'cat_conference' WHERE "category" = 'CONFERENCE';
UPDATE "events" SET "categoryId" = 'cat_workshop' WHERE "category" = 'WORKSHOP';
UPDATE "events" SET "categoryId" = 'cat_seminar' WHERE "category" = 'SEMINAR';
UPDATE "events" SET "categoryId" = 'cat_meeting' WHERE "category" = 'MEETING';

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop old enum column and type
ALTER TABLE "events" DROP COLUMN "category";
DROP TYPE "EventCategory";
