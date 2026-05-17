-- CreateEnum
CREATE TYPE "CalibrationAssetType" AS ENUM ('PRIMARY_STANDARD', 'SECONDARY_STANDARD', 'FIELD_TEST_INSTRUMENT', 'EQUIPMENT_INSTRUMENTATION', 'TEST_THERMOCOUPLE', 'REFERENCE_STANDARD', 'OTHER');

-- CreateEnum
CREATE TYPE "CalibrationResult" AS ENUM ('PASS', 'FAIL', 'LIMITED', 'AS_FOUND_ONLY', 'VOID');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "calibrationRecordId" TEXT;

-- CreateTable
CREATE TABLE "CalibrationAsset" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assetCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CalibrationAssetType" NOT NULL,
    "description" TEXT,
    "serialNumber" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "qrCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalibrationAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationRecord" (
    "id" TEXT NOT NULL,
    "calibratedAssetId" TEXT NOT NULL,
    "referenceAssetId" TEXT,
    "certificateNumber" TEXT,
    "calibrationDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "laboratory" TEXT,
    "result" "CalibrationResult" NOT NULL DEFAULT 'PASS',
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalibrationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationPoint" (
    "id" TEXT NOT NULL,
    "calibrationRecordId" TEXT NOT NULL,
    "nominalTemperature" DOUBLE PRECISION NOT NULL,
    "indicatedReading" DOUBLE PRECISION,
    "referenceReading" DOUBLE PRECISION,
    "correctionFactor" DOUBLE PRECISION NOT NULL,
    "temperatureUnit" "TemperatureUnit" NOT NULL,
    "uncertainty" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalibrationPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalibrationAsset_qrCode_key" ON "CalibrationAsset"("qrCode");

-- CreateIndex
CREATE INDEX "CalibrationAsset_organizationId_type_status_idx" ON "CalibrationAsset"("organizationId", "type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CalibrationAsset_organizationId_assetCode_key" ON "CalibrationAsset"("organizationId", "assetCode");

-- CreateIndex
CREATE INDEX "CalibrationRecord_calibratedAssetId_calibrationDate_idx" ON "CalibrationRecord"("calibratedAssetId", "calibrationDate");

-- CreateIndex
CREATE INDEX "CalibrationRecord_referenceAssetId_idx" ON "CalibrationRecord"("referenceAssetId");

-- CreateIndex
CREATE INDEX "CalibrationRecord_calibratedAssetId_active_idx" ON "CalibrationRecord"("calibratedAssetId", "active");

-- CreateIndex
CREATE INDEX "CalibrationPoint_calibrationRecordId_temperatureUnit_idx" ON "CalibrationPoint"("calibrationRecordId", "temperatureUnit");

-- CreateIndex
CREATE UNIQUE INDEX "CalibrationPoint_calibrationRecordId_nominalTemperature_tem_key" ON "CalibrationPoint"("calibrationRecordId", "nominalTemperature", "temperatureUnit");

-- AddForeignKey
ALTER TABLE "CalibrationAsset" ADD CONSTRAINT "CalibrationAsset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationRecord" ADD CONSTRAINT "CalibrationRecord_calibratedAssetId_fkey" FOREIGN KEY ("calibratedAssetId") REFERENCES "CalibrationAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationRecord" ADD CONSTRAINT "CalibrationRecord_referenceAssetId_fkey" FOREIGN KEY ("referenceAssetId") REFERENCES "CalibrationAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationPoint" ADD CONSTRAINT "CalibrationPoint_calibrationRecordId_fkey" FOREIGN KEY ("calibrationRecordId") REFERENCES "CalibrationRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_calibrationRecordId_fkey" FOREIGN KEY ("calibrationRecordId") REFERENCES "CalibrationRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
