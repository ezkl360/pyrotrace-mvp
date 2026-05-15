import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const provider = await prisma.organization.upsert({
    where: { name: 'PyroMet Services Demo' },
    update: {},
    create: { name: 'PyroMet Services Demo', type: 'PYROMETRY_PROVIDER', notes: 'Empresa proveedora de servicios de pirometría para clientes externos.' },
  });

  const customer = await prisma.organization.upsert({
    where: { name: 'AeroHeat Customer Plant' },
    update: {},
    create: { name: 'AeroHeat Customer Plant', type: 'CUSTOMER', notes: 'Cliente dueño de equipos térmicos.' },
  });

  await prisma.providerCustomer.upsert({
    where: { providerOrgId_customerOrgId: { providerOrgId: provider.id, customerOrgId: customer.id } },
    update: {},
    create: { providerOrgId: provider.id, customerOrgId: customer.id, serviceScope: 'SAT, TUS, calibración y reportes de auditoría.' },
  });

  const user = await prisma.user.upsert({
    where: { email: 'tech@pyromet.demo' },
    update: {},
    create: { organizationId: provider.id, name: 'Técnico de pirometría', email: 'tech@pyromet.demo', role: 'PYROMETRY_TECH' },
  });

  const site = await prisma.site.upsert({
    where: { id: 'demo-site-01' },
    update: {},
    create: { id: 'demo-site-01', ownerOrganizationId: provider.id, customerOrganizationId: customer.id, name: 'Planta Cliente Norte', code: 'PCN', city: 'Monterrey', state: 'NL', country: 'MX' },
  });

  const furnace = await prisma.equipment.upsert({
    where: { qrCode: 'QR-EQ-FURNACE-001' },
    update: {},
    create: {
      siteId: site.id,
      equipmentCode: 'HT-001',
      name: 'Horno de tratamiento térmico 1',
      process: 'Austenitizado',
      furnaceClass: 'Class 2',
      instrumentationType: 'Type B',
      operatingRange: '500–950 °C',
      satFrequencyDays: 90,
      tusFrequencyDays: 180,
      calibrationFrequencyDays: 365,
      qrCode: 'QR-EQ-FURNACE-001',
    },
  });

  const schedule = await prisma.testSchedule.upsert({
    where: { id: 'demo-schedule-sat-01' },
    update: {},
    create: {
      id: 'demo-schedule-sat-01',
      equipmentId: furnace.id,
      type: 'SAT',
      title: 'SAT trimestral HT-001',
      plannedStart: new Date('2026-05-20T09:00:00-05:00'),
      plannedEnd: new Date('2026-05-20T11:00:00-05:00'),
      dueDate: new Date('2026-05-25T23:59:59-05:00'),
      assignedToUserId: user.id,
      status: 'PLANNED',
      notes: 'Programación inicial del módulo de pruebas.',
    },
  });

  const record = await prisma.pyrometryRecord.upsert({
    where: { id: 'demo-record-cal-01' },
    update: {},
    create: {
      id: 'demo-record-cal-01',
      scheduleId: schedule.id,
      equipmentId: furnace.id,
      type: 'CALIBRATION',
      status: 'APPROVED',
      performedAt: new Date('2026-05-10T10:30:00-05:00'),
      result: 'PASS',
      maxError: 0.8,
      tolerance: 2.0,
      technicianNotes: 'Registro demo para validar storage documental.',
    },
  });

  await prisma.document.upsert({
    where: { id: 'demo-doc-cal-01' },
    update: {},
    create: {
      id: 'demo-doc-cal-01',
      organizationId: provider.id,
      equipmentId: furnace.id,
      recordId: record.id,
      category: 'CALIBRATION_REPORT',
      title: 'Reporte de calibración HT-001 mayo 2026',
      fileName: 'HT-001_CAL_2026-05.pdf',
      storageBucket: 'pyrotrace-reports',
      storagePath: `${provider.id}/${customer.id}/HT-001/CAL/HT-001_CAL_2026-05.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: 245000,
      version: 1,
    },
  });
}

main().finally(async () => prisma.$disconnect());
