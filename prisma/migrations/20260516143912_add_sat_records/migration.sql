-- CreateTable
CREATE TABLE "SatRecord" (
    "id" TEXT NOT NULL,
    "pyrometryRecordId" TEXT NOT NULL,
    "setpoint" DOUBLE PRECISION NOT NULL,
    "systemReading" DOUBLE PRECISION NOT NULL,
    "referenceReading" DOUBLE PRECISION NOT NULL,
    "correctionFactor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "correctedReferenceReading" DOUBLE PRECISION NOT NULL,
    "error" DOUBLE PRECISION NOT NULL,
    "absoluteError" DOUBLE PRECISION NOT NULL,
    "pass" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SatRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SatRecord_pyrometryRecordId_key" ON "SatRecord"("pyrometryRecordId");

-- AddForeignKey
ALTER TABLE "SatRecord" ADD CONSTRAINT "SatRecord_pyrometryRecordId_fkey" FOREIGN KEY ("pyrometryRecordId") REFERENCES "PyrometryRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
