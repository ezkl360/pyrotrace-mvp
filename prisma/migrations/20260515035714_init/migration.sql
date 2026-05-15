-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('PYROMETRY_PROVIDER', 'INTERNAL_HEAT_TREAT', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'QUALITY_MANAGER', 'PYROMETRY_TECH', 'AUDITOR', 'CUSTOMER_VIEWER');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('SAT', 'TUS', 'CALIBRATION', 'THERMOCOUPLE_USAGE', 'MAINTENANCE_CHECK');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PLANNED', 'DUE_SOON', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'VOIDED');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'DUE_SOON', 'OVERDUE', 'BLOCKED', 'RETIRED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('SAT_REPORT', 'TUS_REPORT', 'CALIBRATION_REPORT', 'CERTIFICATE', 'PHOTO_EVIDENCE', 'PROCEDURE', 'AUDIT_PACKAGE', 'OTHER');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL DEFAULT 'INTERNAL_HEAT_TREAT',
    "legalName" TEXT,
    "taxId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderCustomer" (
    "id" TEXT NOT NULL,
    "providerOrgId" TEXT NOT NULL,
    "customerOrgId" TEXT NOT NULL,
    "serviceScope" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER_VIEWER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "ownerOrganizationId" TEXT NOT NULL,
    "customerOrganizationId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "equipmentCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "process" TEXT,
    "furnaceClass" TEXT,
    "instrumentationType" TEXT,
    "operatingRange" TEXT,
    "satFrequencyDays" INTEGER,
    "tusFrequencyDays" INTEGER,
    "calibrationFrequencyDays" INTEGER,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "qrCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instrument" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "instrumentCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serialNumber" TEXT,
    "calibrationDue" TIMESTAMP(3),
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "qrCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceStandard" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "uncertainty" TEXT,
    "calibrationDue" TIMESTAMP(3),
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "qrCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferenceStandard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thermocouple" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lot" TEXT,
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "maxExposureHours" DOUBLE PRECISION,
    "exposureHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxTemperature" DOUBLE PRECISION,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "qrCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thermocouple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSchedule" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "type" "TestType" NOT NULL,
    "title" TEXT NOT NULL,
    "plannedStart" TIMESTAMP(3) NOT NULL,
    "plannedEnd" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "assignedToUserId" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PLANNED',
    "recurrenceRule" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PyrometryRecord" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT,
    "equipmentId" TEXT NOT NULL,
    "instrumentId" TEXT,
    "thermocoupleId" TEXT,
    "referenceStandardId" TEXT,
    "type" "TestType" NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'DRAFT',
    "performedAt" TIMESTAMP(3),
    "result" TEXT,
    "tolerance" DOUBLE PRECISION,
    "maxError" DOUBLE PRECISION,
    "maxDeviation" DOUBLE PRECISION,
    "technicianNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PyrometryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "equipmentId" TEXT,
    "recordId" TEXT,
    "instrumentId" TEXT,
    "thermocoupleId" TEXT,
    "referenceStandardId" TEXT,
    "category" "DocumentCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageBucket" TEXT NOT NULL DEFAULT 'pyrotrace-reports',
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "checksum" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT NOT NULL,
    "recommendation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderCustomer_providerOrgId_customerOrgId_key" ON "ProviderCustomer"("providerOrgId", "customerOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_qrCode_key" ON "Equipment"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_qrCode_key" ON "Instrument"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceStandard_code_key" ON "ReferenceStandard"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceStandard_qrCode_key" ON "ReferenceStandard"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Thermocouple_code_key" ON "Thermocouple"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Thermocouple_qrCode_key" ON "Thermocouple"("qrCode");

-- CreateIndex
CREATE INDEX "TestSchedule_type_dueDate_status_idx" ON "TestSchedule"("type", "dueDate", "status");

-- CreateIndex
CREATE INDEX "Document_organizationId_category_createdAt_idx" ON "Document"("organizationId", "category", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProviderCustomer" ADD CONSTRAINT "ProviderCustomer_providerOrgId_fkey" FOREIGN KEY ("providerOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderCustomer" ADD CONSTRAINT "ProviderCustomer_customerOrgId_fkey" FOREIGN KEY ("customerOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_ownerOrganizationId_fkey" FOREIGN KEY ("ownerOrganizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_customerOrganizationId_fkey" FOREIGN KEY ("customerOrganizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSchedule" ADD CONSTRAINT "TestSchedule_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSchedule" ADD CONSTRAINT "TestSchedule_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PyrometryRecord" ADD CONSTRAINT "PyrometryRecord_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "TestSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PyrometryRecord" ADD CONSTRAINT "PyrometryRecord_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PyrometryRecord" ADD CONSTRAINT "PyrometryRecord_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PyrometryRecord" ADD CONSTRAINT "PyrometryRecord_thermocoupleId_fkey" FOREIGN KEY ("thermocoupleId") REFERENCES "Thermocouple"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PyrometryRecord" ADD CONSTRAINT "PyrometryRecord_referenceStandardId_fkey" FOREIGN KEY ("referenceStandardId") REFERENCES "ReferenceStandard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "PyrometryRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_thermocoupleId_fkey" FOREIGN KEY ("thermocoupleId") REFERENCES "Thermocouple"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_referenceStandardId_fkey" FOREIGN KEY ("referenceStandardId") REFERENCES "ReferenceStandard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "PyrometryRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "PyrometryRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
