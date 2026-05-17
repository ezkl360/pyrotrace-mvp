/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,instrumentCode]` on the table `Instrument` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "InstrumentCorrectionFactor" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "nominalTemperature" DOUBLE PRECISION NOT NULL,
    "correctionFactor" DOUBLE PRECISION NOT NULL,
    "temperatureUnit" "TemperatureUnit" NOT NULL,
    "uncertainty" DOUBLE PRECISION,
    "certificateNumber" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstrumentCorrectionFactor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InstrumentCorrectionFactor_instrumentId_temperatureUnit_idx" ON "InstrumentCorrectionFactor"("instrumentId", "temperatureUnit");

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentCorrectionFactor_instrumentId_nominalTemperature__key" ON "InstrumentCorrectionFactor"("instrumentId", "nominalTemperature", "temperatureUnit");

-- CreateIndex
CREATE INDEX "Instrument_organizationId_status_idx" ON "Instrument"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_organizationId_instrumentCode_key" ON "Instrument"("organizationId", "instrumentCode");

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentCorrectionFactor" ADD CONSTRAINT "InstrumentCorrectionFactor_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
