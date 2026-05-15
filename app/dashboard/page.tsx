import { Shell } from '@/components/Shell';
import { Card } from '@/components/Card';
import { prisma } from '@/lib/prisma';
import { statusBadge } from '@/lib/status';
import { format } from 'date-fns';

export default async function DashboardPage() {
  const [companies, equipment, schedules, documents] = await Promise.all([
    prisma.organization.count(),
    prisma.equipment.count(),
    prisma.testSchedule.findMany({ orderBy: { dueDate: 'asc' }, take: 8, include: { equipment: { include: { site: { include: { customerOrganization: true } } } } } }),
    prisma.document.count(),
  ]);

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard ejecutivo</h1>
        <p className="mt-2 text-slate-600">Control central de empresas, equipos, programación de pruebas y reportes en storage.</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <Card title="Empresas"><p className="text-4xl font-bold">{companies}</p></Card>
        <Card title="Equipos"><p className="text-4xl font-bold">{equipment}</p></Card>
        <Card title="Pruebas programadas"><p className="text-4xl font-bold">{schedules.length}</p></Card>
        <Card title="Reportes en storage"><p className="text-4xl font-bold">{documents}</p></Card>
      </div>
      <div className="mt-6">
        <Card title="Próximas pruebas">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b text-slate-500"><th className="py-3">Fecha límite</th><th>Tipo</th><th>Equipo</th><th>Empresa cliente</th><th>Estado</th></tr></thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-3">{format(s.dueDate, 'yyyy-MM-dd')}</td>
                  <td>{s.type}</td>
                  <td>{s.equipment.equipmentCode} · {s.equipment.name}</td>
                  <td>{s.equipment.site.customerOrganization?.name ?? 'Interna'}</td>
                  <td><span className={statusBadge(s.status)}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Shell>
  );
}
