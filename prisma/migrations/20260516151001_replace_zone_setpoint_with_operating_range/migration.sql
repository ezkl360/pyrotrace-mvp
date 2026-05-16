/*
  Warnings:

  - You are about to drop the column `typicalSetpoint` on the `EquipmentZone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EquipmentZone" DROP COLUMN "typicalSetpoint",
ADD COLUMN     "nominalSetpoint" DOUBLE PRECISION,
ADD COLUMN     "operatingMax" DOUBLE PRECISION,
ADD COLUMN     "operatingMin" DOUBLE PRECISION;
