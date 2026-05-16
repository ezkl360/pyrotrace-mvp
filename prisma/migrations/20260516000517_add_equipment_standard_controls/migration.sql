/*
  Warnings:

  - A unique constraint covering the columns `[siteId,equipmentCode]` on the table `Equipment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ApplicableStandard" AS ENUM ('AMS2750', 'AMS2770', 'CQI_9', 'CQI_11', 'CQI_12', 'CUSTOMER_SPECIFIC', 'OTHER');

-- CreateEnum
CREATE TYPE "AmsFurnaceClass" AS ENUM ('NOT_APPLICABLE', 'CLASS_1', 'CLASS_2', 'CLASS_3', 'CLASS_4', 'CLASS_5', 'CLASS_6');

-- CreateEnum
CREATE TYPE "AmsInstrumentationType" AS ENUM ('NOT_APPLICABLE', 'TYPE_A', 'TYPE_B', 'TYPE_C', 'TYPE_D', 'TYPE_E');

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "amsFurnaceClass" "AmsFurnaceClass" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN     "amsInstrumentationType" "AmsInstrumentationType" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN     "applicableStandard" "ApplicableStandard" NOT NULL DEFAULT 'AMS2750',
ADD COLUMN     "customerSpecificRequirement" TEXT;

-- CreateIndex
CREATE INDEX "Equipment_applicableStandard_status_idx" ON "Equipment"("applicableStandard", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_siteId_equipmentCode_key" ON "Equipment"("siteId", "equipmentCode");
