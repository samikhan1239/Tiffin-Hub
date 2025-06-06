/*
  Warnings:

  - The `status` column on the `DailyUpdate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Enrollment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `read` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `superadminSurcharge` on the `Tiffin` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `mealDetails` on the `DailyUpdate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `startDate` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyUpdateId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dietaryPrefs` to the `Tiffin` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `mealDetails` on the `Tiffin` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `specialDays` on the `Tiffin` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin', 'superadmin');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('active', 'cancelled', 'deactivated');

-- CreateEnum
CREATE TYPE "UpdateStatus" AS ENUM ('pending', 'accepted', 'cancelled');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('sent', 'read');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'approved', 'rejected');

-- DropForeignKey
ALTER TABLE "DailyUpdate" DROP CONSTRAINT "DailyUpdate_userId_fkey";

-- AlterTable
ALTER TABLE "DailyUpdate" ALTER COLUMN "userId" DROP NOT NULL,
DROP COLUMN "mealDetails",
ADD COLUMN     "mealDetails" JSONB NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "UpdateStatus" NOT NULL DEFAULT 'pending',
ALTER COLUMN "date" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "EnrollmentStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "read",
ADD COLUMN     "dailyUpdateId" INTEGER NOT NULL,
ADD COLUMN     "status" "NotificationStatus" NOT NULL DEFAULT 'sent',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Tiffin" DROP COLUMN "superadminSurcharge",
ADD COLUMN     "adminCharge" DOUBLE PRECISION NOT NULL DEFAULT 500.0,
ADD COLUMN     "cancelNoticePeriod" INTEGER,
ADD COLUMN     "dietaryPrefs" TEXT NOT NULL,
ADD COLUMN     "eveningCancelTime" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "minSubscriptionDays" INTEGER,
ADD COLUMN     "morningCancelTime" TEXT,
ADD COLUMN     "superadminSurplus" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
DROP COLUMN "mealDetails",
ADD COLUMN     "mealDetails" JSONB NOT NULL,
DROP COLUMN "specialDays",
ADD COLUMN     "specialDays" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isApproved",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "adminCharge" DOUBLE PRECISION NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_adminId_month_idx" ON "Payment"("adminId", "month");

-- CreateIndex
CREATE INDEX "DailyUpdate_tiffinId_date_idx" ON "DailyUpdate"("tiffinId", "date");

-- CreateIndex
CREATE INDEX "Enrollment_userId_tiffinId_idx" ON "Enrollment"("userId", "tiffinId");

-- CreateIndex
CREATE INDEX "Notification_userId_dailyUpdateId_idx" ON "Notification"("userId", "dailyUpdateId");

-- CreateIndex
CREATE INDEX "Tiffin_adminId_idx" ON "Tiffin"("adminId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "DailyUpdate" ADD CONSTRAINT "DailyUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_dailyUpdateId_fkey" FOREIGN KEY ("dailyUpdateId") REFERENCES "DailyUpdate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
