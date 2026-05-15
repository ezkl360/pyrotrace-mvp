import { Shell } from '@/components/Shell';
import { Card } from '@/components/Card';
import { prisma } from '@/lib/prisma';
import { statusBadge } from '@/lib/status';
import { format } from 'date-fns';

export default async function TestsPage() {
  const schedules = await prisma.testSchedule.findMany({ orderBy: { dueDate: 'asc' }, include: { assignedTo: true, equipment: { include: { site: { include: { customerOrganization: true } } } } } });
  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Programación de pruebas</h1>
        <p className="mt-2 text-slate-600">Módulo nuevo para calendarizar SAT, TUS, calibraciones y verificaciones; controla fechas límite, responsables y estado.</p>
      </div>
      <Card title="Calendario operativo">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b text-slate-500"><th className="py-3">Vence</th><th>Tipo</th><th>Título</th><th>Equipo</th><th>Empresa</th><th>Responsable</th><th>Estado</th></tr></thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="py-3">{format(s.dueDate, 'yyyy-MM-dd')}</td>
                <td>{s.type}</td>
                <td>{s.title}</td>
                <td>{s.equipment.equipmentCode}</td>
                <td>{s.equipment.site.customerOrganization?.name ?? 'Interna'}</td>
                <td>{s.assignedTo?.name ?? 'Sin asignar'}</td>
                <td><span className={statusBadge(s.status)}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
