/*
  Warnings:

  - You are about to drop the column `name` on the `Day` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[weekday,routineId]` on the table `Day` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `weekday` to the `Day` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- DropIndex
DROP INDEX "Day_name_routineId_key";

-- AlterTable
ALTER TABLE "Day" DROP COLUMN "name",
ADD COLUMN     "weekday" "Weekday" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Day_weekday_routineId_key" ON "Day"("weekday", "routineId");
