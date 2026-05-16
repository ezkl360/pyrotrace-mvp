-- CreateEnum
CREATE TYPE "TemperatureUnit" AS ENUM ('CELSIUS', 'FAHRENHEIT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TestType" ADD VALUE 'ALARM_TEST';
ALTER TYPE "TestType" ADD VALUE 'OTHER_TEST';

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "temperatureUnit" "TemperatureUnit" NOT NULL DEFAULT 'CELSIUS';

-- AlterTable
ALTER TABLE "PyrometryRecord" ADD COLUMN     "complianceRuleId" TEXT;

-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "defaultTemperatureUnit" "TemperatureUnit" NOT NULL DEFAULT 'CELSIUS';

-- CreateTable
CREATE TABLE "ComplianceRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "applicableStandard" "ApplicableStandard" NOT NULL,
    "testType" "TestType" NOT NULL,
    "temperatureUnit" "TemperatureUnit" NOT NULL,
    "amsFurnaceClass" "AmsFurnaceClass" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "amsInstrumentationType" "AmsInstrumentationType" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "toleranceLimit" DOUBLE PRECISION NOT NULL,
    "toleranceLabel" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplianceRule_applicableStandard_testType_temperatureUnit_idx" ON "ComplianceRule"("applicableStandard", "testType", "temperatureUnit");

-- CreateIndex
CREATE INDEX "ComplianceRule_amsFurnaceClass_amsInstrumentationType_idx" ON "ComplianceRule"("amsFurnaceClass", "amsInstrumentationType");

-- CreateIndex
CREATE INDEX "Equipment_temperatureUnit_idx" ON "Equipment"("temperatureUnit");

-- AddForeignKey
ALTER TABLE "PyrometryRecord" ADD CONSTRAINT "PyrometryRecord_complianceRuleId_fkey" FOREIGN KEY ("complianceRuleId") REFERENCES "ComplianceRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
