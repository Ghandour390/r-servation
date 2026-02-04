-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('CONFERENCE', 'WORKSHOP', 'SEMINAR', 'MEETING');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "category" "EventCategory",
ADD COLUMN     "price" DOUBLE PRECISION;
