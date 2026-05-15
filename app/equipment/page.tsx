import { Shell } from '@/components/Shell';
import { Card } from '@/components/Card';
import { prisma } from '@/lib/prisma';
import { statusBadge } from '@/lib/status';

export default async function EquipmentPage() {
  const equipment = await prisma.equipment.findMany({ include: { site: { include: { ownerOrganization: true, customerOrganization: true } } }, orderBy: { equipmentCode: 'asc' } });
  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Equipos térmicos</h1>
        <p className="mt-2 text-slate-600">Cada equipo queda ligado a sitio, empresa operadora y empresa cliente cuando aplique.</p>
      </div>
      <Card title="Activos registrados">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b text-slate-500"><th className="py-3">ID</th><th>Equipo</th><th>Sitio</th><th>Proveedor / dueño</th><th>Cliente</th><th>Estado</th></tr></thead>
          <tbody>
            {equipment.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="py-3 font-mono text-xs">{e.equipmentCode}</td>
                <td>{e.name}</td>
                <td>{e.site.name}</td>
                <td>{e.site.ownerOrganization.name}</td>
                <td>{e.site.customerOrganization?.name ?? 'Interno'}</td>
                <td><span className={statusBadge(e.status)}>{e.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
