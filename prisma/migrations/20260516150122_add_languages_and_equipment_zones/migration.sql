-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "defaultLanguage" TEXT NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en';

-- CreateTable
CREATE TABLE "EquipmentZone" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "zoneCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "typicalSetpoint" DOUBLE PRECISION,
    "requiresSat" BOOLEAN NOT NULL DEFAULT true,
    "requiresCalibration" BOOLEAN NOT NULL DEFAULT true,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentZone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EquipmentZone_equipmentId_status_idx" ON "EquipmentZone"("equipmentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentZone_equipmentId_zoneCode_key" ON "EquipmentZone"("equipmentId", "zoneCode");

-- AddForeignKey
ALTER TABLE "EquipmentZone" ADD CONSTRAINT "EquipmentZone_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
