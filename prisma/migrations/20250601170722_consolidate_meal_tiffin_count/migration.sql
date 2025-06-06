/*
  Warnings:

  - You are about to drop the column `dailyUpdateId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the `DailyUpdate` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MealStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- DropForeignKey
ALTER TABLE "DailyUpdate" DROP CONSTRAINT "DailyUpdate_tiffinId_fkey";

-- DropForeignKey
ALTER TABLE "DailyUpdate" DROP CONSTRAINT "DailyUpdate_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_dailyUpdateId_fkey";

-- DropIndex
DROP INDEX "Notification_userId_dailyUpdateId_idx";

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "tiffinCount" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "dailyUpdateId",
ADD COLUMN     "mealId" INTEGER;

-- DropTable
DROP TABLE "DailyUpdate";

-- DropEnum
DROP TYPE "UpdateStatus";

-- CreateTable
CREATE TABLE "Meal" (
    "id" SERIAL NOT NULL,
    "tiffinId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sabjis" TEXT,
    "roti" TEXT,
    "chawal" TEXT,
    "sweet" TEXT,
    "status" "MealStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meal_tiffinId_userId_date_idx" ON "Meal"("tiffinId", "userId", "date");

-- CreateIndex
CREATE INDEX "Notification_userId_mealId_idx" ON "Notification"("userId", "mealId");

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_tiffinId_fkey" FOREIGN KEY ("tiffinId") REFERENCES "Tiffin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
