/*
  Warnings:

  - You are about to drop the column `price` on the `Tiffin` table. All the data in the column will be lost.
  - Added the required column `basePrice` to the `Tiffin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mealDetails` to the `Tiffin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mealFrequency` to the `Tiffin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialDaysCount` to the `Tiffin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Tiffin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tiffin" DROP COLUMN "price",
ADD COLUMN     "basePrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "deliveryTime" TEXT,
ADD COLUMN     "isVegetarian" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxCapacity" INTEGER,
ADD COLUMN     "mealDetails" TEXT NOT NULL,
ADD COLUMN     "mealFrequency" TEXT NOT NULL,
ADD COLUMN     "oneTimePrice" DOUBLE PRECISION,
ADD COLUMN     "specialDays" JSONB[],
ADD COLUMN     "specialDaysCount" INTEGER NOT NULL,
ADD COLUMN     "superadminSurcharge" DOUBLE PRECISION NOT NULL DEFAULT 200.0,
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "trialCost" DOUBLE PRECISION,
ADD COLUMN     "twoTimePrice" DOUBLE PRECISION,
ALTER COLUMN "photo" DROP NOT NULL;
